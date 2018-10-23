/// <reference types="youtube" />
import {
  Directive,
  OnInit,
  AfterViewInit,
  EventEmitter,
  Output,
  ElementRef,
  Input
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { collectBuffer } from '../rx-extensions/collectBuffer';
import { PlayerStatus } from '../models/playerStatus';
import { v4 as uuid } from 'uuid';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ytPlayer]'
})
export class YtPlayerDirective implements OnInit, AfterViewInit {
  // #region Private Fields
  // 播放器狀態
  private _status = PlayerStatus.SDK_Loading;
  private _videoId: string;
  private _nativePlayer: YT.Player;
  private _autoPlay = false;
  private _loop = false;
  private _controls = true;
  private _allowFullScreen = false;
  private _volume = 100;
  // #endregion

  // #region Public Properties
  /**
   * 播放器狀態
   */
  public get status() {
    return this._status;
  }

  /**
   * 狀態變化事件
   */
  @Output()
  public statusChange = new EventEmitter<PlayerStatus>();

  public get videoId() {
    return this._videoId;
  }

  @Input()
  public set videoId(value: string) {
    if (this._nativePlayer != null) {
      this._nativePlayer.cueVideoById(value);
      if (this._autoPlay) {
        this._nativePlayer.playVideo();
      }
    }
    this._videoId = value;
  }

  /**
   * 取得Youtube播放器
   */
  public get nativePlayer() {
    return this._nativePlayer;
  }

  public get autoPlay() {
    return this._autoPlay;
  }

  @Input()
  public set autoPlay(value: boolean) {
    this._autoPlay = value;
    if (this._nativePlayer) {
      this._nativePlayer.playVideo();
    }
  }

  public get loop() {
    return this._loop;
  }

  @Input()
  public set loop(value: boolean) {
    this._loop = value;
    if (this.nativePlayer) {
      this._nativePlayer.setLoop(value);
    }
  }

  public get controls() {
    return this._controls;
  }

  @Input()
  public set controls(value: boolean) {
    this._controls = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }

  public get allowFullScreen() {
    return this._allowFullScreen;
  }

  @Input()
  public set allowFullScreen(value: boolean) {
    this._allowFullScreen = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }

  public get volume() {
    if (!this._nativePlayer) {
      return 100;
    }
    return (this._volume = this._nativePlayer.getVolume());
  }

  @Input()
  public set volume(value: number) {
    this._volume = value;
    if (this._nativePlayer) {
      this._nativePlayer.setVolume(value);
    }
  }

  @Output()
  public volumeChange = new EventEmitter<number>();

  @Output()
  public error = new EventEmitter<YT.OnErrorEvent>();
  // #endregion

  constructor(private element: ElementRef) {
    // 訂閱Youtube SDK初始化狀態
    const initSuber = this.statusChange
      .pipe(collectBuffer([PlayerStatus.DOMDone, PlayerStatus.SDK_Loaded]))
      .subscribe(x => {
        this.updateStatus(PlayerStatus.Initialize);
        this.initPlayer();
        initSuber.unsubscribe();
      });
    const volumeChecker = timer(0, 100).subscribe(x => {
      if (this._nativePlayer) {
        this.volumeChange.emit(this.volume);
      }
    });
  }

  // #region LifeCycleHooks
  /**
   * 初始化階段載入Youtube SDK
   */
  ngOnInit(): void {
    const youtubeElId = 'youtubeJsSdk';
    const youtubeScriptEl = document.getElementById(youtubeElId);
    if (youtubeScriptEl === null) {
      (<any>window).onYouTubeIframeAPIReady = () => {
        this.updateStatus(PlayerStatus.SDK_Loaded);
      };
      let js: HTMLScriptElement;
      const scripts = document.getElementsByTagName('script')[0];
      js = document.createElement('script');
      js.id = youtubeElId;
      js.src = '//www.youtube.com/iframe_api';
      scripts.parentNode.insertBefore(js, youtubeScriptEl);
    }
  }

  /**
   * DOM生成後初始化Youtube播放器
   */
  ngAfterViewInit(): void {
    this.updateStatus(PlayerStatus.DOMDone);
  }
  // #endregion

  // #region Private Methods
  private updateStatus(status: PlayerStatus): void {
    this._status = status;
    this.statusChange.emit(status);
  }

  private initPlayer() {
    this.element.nativeElement.id = uuid();
    const player = new YT.Player(this.element.nativeElement.id, {
      videoId: this.videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        controls: this._controls ? 1 : 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: this._allowFullScreen ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3
      },
      events: {
        onReady: () => {
          this._nativePlayer = player;
          this.updateStatus(PlayerStatus.Ready);
          if (this._autoPlay) {
            this._nativePlayer.playVideo();
          }
          this._nativePlayer.setVolume(this._volume);
        },
        onError: error => {
          this.error.emit(error);
        },
        onStateChange: change => {
          console.log(change);
        }
      }
    });
  }

  private destroyPlayer() {
    if (this._nativePlayer) {
      this._nativePlayer.destroy();
    }
  }
  // #endregion
}
