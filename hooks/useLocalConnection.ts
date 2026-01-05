import { useEffect, useRef, useState, useCallback } from 'react';

// 구글 무료 STUN 서버
const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const useLocalConnection = () => {
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);
    
    // WebRTC & DataChannel 객체
    const pc = useRef<RTCPeerConnection | null>(null);
    const dc = useRef<RTCDataChannel | null>(null);
    
    // 시그널링 흉내내기 (탭 간 통신)
    const channel = useRef(new BroadcastChannel('bms_local_signaling'));

    const addLog = (msg: string) => setLogs(prev => [...prev, `[SYS] ${msg}`]);

    // 1. 초기화 및 리스너 설정
    useEffect(() => {
        pc.current = new RTCPeerConnection(ICE_SERVERS);

        // ICE Candidate(네트워크 경로) 찾으면 옆 탭으로 전송
        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                channel.current.postMessage({ type: 'candidate', payload: event.candidate });
            }
        };

        // 데이터 채널이 들어오면 (게스트 입장)
        pc.current.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            setupDataChannel(receiveChannel);
        };

        // 옆 탭에서 오는 메시지 수신 (Signaling Server 역할)
        channel.current.onmessage = async (event) => {
            const { type, payload } = event.data;
            if (!pc.current) return;

            try {
                if (type === 'offer') {
                    addLog('Offer received. Generating Answer...');
                    await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
                    const answer = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answer);
                    channel.current.postMessage({ type: 'answer', payload: answer });
                } 
                else if (type === 'answer') {
                    addLog('Answer received. Connection establishing...');
                    await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
                } 
                else if (type === 'candidate') {
                    await pc.current.addIceCandidate(new RTCIceCandidate(payload));
                }
            } catch (err) {
                console.error(err);
            }
        };

        return () => {
            pc.current?.close();
            channel.current.close();
        };
    }, []);

    // 2. 데이터 채널 설정 (메시지 주고받기)
    const setupDataChannel = (dataChannel: RTCDataChannel) => {
        dc.current = dataChannel;
        setStatus('CONNECTED');
        addLog('Data Link Established.');

        dataChannel.onopen = () => addLog('Channel Open');
        dataChannel.onmessage = (e) => addLog(`RX: ${e.data}`);
    };

    // 3. 연결 시작 (호스트가 호출)
    const startConnection = async () => {
        if (!pc.current) return;
        setStatus('CONNECTING');
        addLog('Initializing Uplink...');

        // 데이터 채널 생성 (호스트 측)
        const dataChannel = pc.current.createDataChannel("bms_chat");
        setupDataChannel(dataChannel);

        // 오퍼 생성 및 전송
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        channel.current.postMessage({ type: 'offer', payload: offer });
    };

    // 4. 데이터 전송
    const sendMessage = (msg: string) => {
        if (dc.current?.readyState === 'open') {
            dc.current.send(msg);
            addLog(`TX: ${msg}`);
        } else {
            addLog('Error: Link not ready.');
        }
    };

    return { status, logs, startConnection, sendMessage };
};