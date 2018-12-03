import {Component, OnInit} from '@angular/core';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private socket;
    private logs;
    title = 'Sample Web Page';

    constructor() {
    }

    ngOnInit(): void {
        this.logs = [];
        this.socket = io();
        this.socket.connect();
        this.socket.on('logs', (log) => {
            // log received data in console
            console.log(JSON.stringify(log, null, 4));
            this.logs.push(log);
        });
    }
}
