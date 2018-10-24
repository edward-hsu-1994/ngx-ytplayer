import { Component } from '@angular/core';
import { PlayerState } from './yt-player/models/playerState';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngx-ytplayer';
  videoId = 'oCR62O7ijBg';
  controls = true;
  volume = 100;

  eventChange(event) {
    console.log(PlayerState[event]);
  }
}
