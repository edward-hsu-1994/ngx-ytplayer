import { Component, ViewChild } from '@angular/core';
import { PlayerState } from './yt-player/models/playerState';
import { YtPlayerDirective } from './yt-player/directives/yt-player.directive';

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

  duration = 0;
  currentTime = 0;

  seek = false;

  @ViewChild(YtPlayerDirective)
  player: YtPlayerDirective;

  eventChange(event) {
    console.log(PlayerState[event]);
  }

  seekTo($event) {
    this.player.seekTo(parseFloat($event.srcElement.value));
  }

  updateCurrentTime(currentTime) {
    if (!this.seek) {
      this.currentTime = currentTime;
    }
  }
}
