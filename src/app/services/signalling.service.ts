import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import { environment } from "src/environments/environment";

const ICE_SERVERS: RTCIceServer[] = [
	{ urls: ["stun:stun.example.com", "stun:stun-1.example.com"] },
	{ urls: "stun:stun.l.google.com:19302" }
];

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
	iceServers: ICE_SERVERS
};

export enum MessageType {
	Login = "login",
	Offer = "offer",
	Answer = "answer",
	Candidate = "candidate",
	Leave = "leave"
}

@Injectable({
	providedIn: "root"
})
export class SignallingService {
	localStreamSubject: Subject<MediaStream>;
	remoteStreamSubject: Subject<MediaStream>;
	socket = webSocket(environment.websocketUrl);

	private localConnection: RTCPeerConnection;
	private remoteUser: string;
	private streamSubjects: Array<Subject<MediaStream>>;

	constructor() {
		this.localStreamSubject = new Subject<MediaStream>();
		this.remoteStreamSubject = new Subject<MediaStream>();
		this.streamSubjects = new Array<Subject<MediaStream>>();
		this.streamSubjects.push(this.localStreamSubject);
		this.streamSubjects.push(this.remoteStreamSubject);
		this.socket.subscribe(
			(message: ServerResponse) => this.onMessage(message),
			error => console.log(error),
			() => console.log("complete")
		);
	}

	onMessage(message: ServerResponse) {
		switch (message.type) {
			case MessageType.Login:
				this.handleLogin(message.data);
				break;
			case MessageType.Offer:
				this.handleOffer(message.data, message.name);
				break;
			case MessageType.Answer:
				this.handleAnswer(message.data);
				break;
			case MessageType.Candidate:
				this.handleCandidate(message.data);
				break;
			case MessageType.Leave:
				this.handleLeave();
				break;
			default:
				console.log(
					"unknown message type: ",
					message.type,
					message.data
				);
				break;
		}
	}

	async handleLogin(success: boolean) {
		if (success === false) {
			alert("Ooops...try a different username");
		} else {
			try {
				let stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true
				});
				this.localStreamSubject.next(stream);

				this.localConnection = new RTCPeerConnection(
					PEER_CONNECTION_CONFIG
				);

				stream
					.getTracks()
					.forEach(track =>
						this.localConnection.addTrack(track, stream)
					);

				this.localConnection.ontrack = event => {
					this.remoteStreamSubject.next(event.streams[0]);
				};

				this.localConnection.onicecandidate = event => {
					if (event.candidate) {
						this.socket.next({
							type: MessageType.Candidate,
							name: this.remoteUser,
							data: event.candidate
						});
					}
				};
			} catch (error) {
				console.log(error);
			}
		}
	}

	handleOffer(offer: RTCSessionDescriptionInit, name: string) {
		this.remoteUser = name;

		this.localConnection.setRemoteDescription(
			new RTCSessionDescription(offer)
		);

		this.localConnection
			.createAnswer()
			.then(answer => {
				this.localConnection.setLocalDescription(answer);
				this.socket.next({
					type: MessageType.Answer,
					name: this.remoteUser,
					data: answer
				});
			})
			.catch(error => alert("error when creating answer: " + error));
	}

	handleAnswer(answer: RTCSessionDescriptionInit) {
		this.localConnection.setRemoteDescription(
			new RTCSessionDescription(answer)
		);
	}

	handleCandidate(candidate: RTCIceCandidateInit) {
		this.localConnection.addIceCandidate(new RTCIceCandidate(candidate));
	}

	handleLeave() {
		this.remoteUser = null;
		this.streamSubjects.forEach(subject => subject.next(null));
		this.localConnection.close();
	}

	call(callee: string) {
		this.remoteUser = callee;
		this.localConnection
			.createOffer()
			.then(offer => {
				this.socket.next({
					type: MessageType.Offer,
					name: callee,
					data: offer
				});
				this.localConnection.setLocalDescription(offer);
			})
			.catch(error => alert("error when creating offer: " + error));
	}
}
