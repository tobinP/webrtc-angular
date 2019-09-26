import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
	SignallingService,
	MessageType
} from "src/app/services/signalling.service";
import { Observable, Observer } from "rxjs";

@Component({
	selector: "app-video",
	templateUrl: "./video.component.html",
	styleUrls: ["./video.component.scss"]
})
export class VideoComponent implements OnInit {
	@ViewChild("localVideo", { static: false }) localVideo: ElementRef;
	@ViewChild("remoteVideo", { static: false }) remoteVideo: ElementRef;

	private observable: Observable<number>;

	constructor(private signallingService: SignallingService) {}

	ngOnInit() {
		this.signallingService.localStreamSubject.subscribe(stream => {
			this.localVideo.nativeElement.srcObject = stream;
		});

		this.signallingService.remoteStreamSubject.subscribe(stream => {
			this.remoteVideo.nativeElement.srcObject = stream;
		});
	}

	registerLocalUser(user: string) {
		this.signallingService.socket.next({
			type: MessageType.Login,
			name: user
		});
	}

	call() {
		this.signallingService.call("A");
	}
}
