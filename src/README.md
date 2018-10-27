# ngx-ytplater

Youtube embedded player wrapper

## Get Started

1. NPM Install

```
npm i ngx-ytplayer
```

2. Import YtPlayerModule

```typescript
import { YtPlayerModule } from './yt-player/yt-player.module';

@NgModule({
  // ...something...
  imports: [YtPlayerModule]
  // ...something...
})
export class YourModule {}
```

3. Add `div` Element with `ytPlayer` directive

```html
<div ytPlayer
  style="height:800px;"
  [videoId]="videoId" // Youtube Video Id
  [(volume)]="volume" // Volume
  [autoPlay]="false" // Auto play when loaded
  [loop]="true" // Auto replay when ended
  [showFullScreenButton]="false" // hidden full screen button
  [showControls]="true" // show player controls
  [enableKB]="true" // enable keyboard control
  (stateChange)="eventChange($event)" // hook player state
  (currentTimeChange)="updateCurrentTime($event)" // hook player current time
  (durationChange)="duration=$event" // get video duration when video loaded
  ></div>
```

## Properties and events

### Properties

| Property             | Input | Output | Default     | Summary                                    |
| -------------------- | ----- | ------ | ----------- | ------------------------------------------ |
| state                |       | ✔️     | SDK_Loading | Player current state                       |
| videoId              | ✔️    | ✔️     | null        | Youtube video id                           |
| nativePlayer         |       | ✔️     | null        | Get native youtube player                  |
| autoPlay             | ✔️    | ✔️     | false       | Auto play when video loaded                |
| loop                 | ✔️    | ✔️     | false       | Auto replay when end                       |
| showControls         | ✔️    | ✔️     | true        | Show native youtube player controls        |
| enableKB             | ✔️    | ✔️     | true        | Enable keyboard control                    |
| showRelatedVideos    | ✔️    | ✔️     | false       | Show related videos when pause or end      |
| showYoutubeLogo      | ✔️    | ✔️     | false       | Show youtube logo                          |
| showFullScreenButton | ✔️    | ✔️     | false       | Show full screen button in native controls |
| volume               | ✔️    | ✔️     | 100         | Get or set player volume                   |
| currentTime          |       | ✔️     | 0           | Get player current time                    |
| duration             |       | ✔️     | 0           | Get player current duration                |

### Events

| Event             | Summary                     |
| ----------------- | --------------------------- |
| stateChange       | Player state change         |
| volumeChange      | Player volume change        |
| currentTimeChange | Player current time change  |
| durationChange    | Player durection change     |
| nativeError       | Youtube player error        |
| nativeStateChange | Youtube player state change |
