interface ServerResponse {
	type: string;
	success: boolean;
	offer: RTCSessionDescriptionInit;
	answer: RTCSessionDescriptionInit;
	candidate: RTCIceCandidateInit;
	name: string;
	data: any;
}
