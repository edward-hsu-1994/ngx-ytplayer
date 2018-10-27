/// <reference types="youtube" />
import {
  Directive,
  OnInit,
  AfterViewInit,
  EventEmitter,
  Output,
  ElementRef,
  Input,
  OnDestroy
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { collectBuffer } from '../rx-extensions';
import { PlayerState } from '../models';
import { v4 as uuid } from 'uuid';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ytPlayer]'
})
export class YtPlayerDirective implements OnInit, AfterViewInit, OnDestroy {
  // #region Private Fields
  // 播放器狀態
  private _state = PlayerState.SDK_Loading;
  private _videoId: string;
  private _nativePlayer: YT.Player;
  private _autoPlay = false;
  private _loop = false;
  private _showControls = true;
  private _showFullScreenButton = false;
  private _showYoutubeLogo = false;
  private _showRelatedVideos = false;
  private _volume = 100;
  private _enableKB = true;
  // #endregion

  // #region Public Properties
  // #region 播放器狀態
  /**
   * 播放器狀態
   */
  public get state() {
    return this._state;
  }

  /**
   * 狀態變化事件
   */
  @Output()
  public stateChange = new EventEmitter<PlayerState>();
  // #endregion

  // #region 影片ID
  public get videoId() {
    return this._videoId;
  }

  @Input()
  public set videoId(value: string) {
    if (this._nativePlayer != null) {
      this._nativePlayer.cueVideoById(value);
      if (this._autoPlay) {
        this._nativePlayer.playVideo();
        this._nativePlayer.setVolume(this._volume);
      }
    }
    this._videoId = value;
  }
  // #endregion

  // #region 取得Youtube SDK播放器物件
  /**
   * 取得Youtube播放器
   */
  public get nativePlayer() {
    return this._nativePlayer;
  }
  // #endregion

  // #region 自動播放
  public get autoPlay() {
    return this._autoPlay;
  }

  @Input()
  public set autoPlay(value: boolean) {
    this._autoPlay = value;
    if (this._nativePlayer && value) {
      this._nativePlayer.playVideo();
    }
  }
  // #endregion

  // #region 循環播放
  public get loop() {
    return this._loop;
  }

  @Input()
  public set loop(value: boolean) {
    this._loop = value;
    if (this._state === PlayerState.Ended) {
      this._nativePlayer.playVideo();
    }
  }
  // #endregion

  // #region 控制項
  public get showControls() {
    return this._showControls;
  }

  @Input()
  public set showControls(value: boolean) {
    this._showControls = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }
  // #endregion

  // #region 啟用鍵盤控制
  public get enableKB() {
    return this._enableKB;
  }

  @Input()
  public set enableKB(value: boolean) {
    this._enableKB = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }
  // #endregion

  // #region 顯示相關影片
  public get showRelatedVideos() {
    return this._showRelatedVideos;
  }

  @Input()
  public set showRelatedVideos(value: boolean) {
    this._showRelatedVideos = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }
  // #endregion

  // #region Youtube Logo
  public get showYoutubeLogo() {
    return this._showYoutubeLogo;
  }

  @Input()
  public set showYoutubeLogo(value: boolean) {
    this._showYoutubeLogo = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }
  // #endregion

  // #region 全螢幕按鈕
  public get showFullScreenButton() {
    return this._showFullScreenButton;
  }

  @Input()
  public set showFullScreenButton(value: boolean) {
    this._showFullScreenButton = value;
    if (this.nativePlayer) {
      this.destroyPlayer();
      this.initPlayer();
    }
  }
  // #endregion

  // #region 音量
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
  // #endregion

  // #region 播放進度
  public get currentTime() {
    if (this._nativePlayer) {
      return this._nativePlayer.getCurrentTime();
    }
    return 0;
  }

  @Output()
  public currentTimeChange = new EventEmitter<number>();
  // #endregion

  // #region 播放總時長
  public get duration() {
    if (this._nativePlayer) {
      return this._nativePlayer.getDuration();
    }
    return 0;
  }

  @Output()
  public durationChange = new EventEmitter<number>();
  // #endregion

  // #region 播放器事件
  @Output()
  public nativeError = new EventEmitter<YT.OnErrorEvent>();

  @Output()
  public nativeStateChange = new EventEmitter<YT.OnStateChangeEvent>();
  // #endregion

  // #endregion

  constructor(private element: ElementRef) {
    // 訂閱Youtube SDK初始化狀態
    const initSuber = this.stateChange
      .pipe(collectBuffer([PlayerState.DOMDone, PlayerState.SDK_Loaded]))
      .subscribe(x => {
        this.initPlayer();
        initSuber.unsubscribe();
      });
    const volumeChecker = timer(0, 100).subscribe(x => {
      if (this._nativePlayer) {
        this.volumeChange.emit(this.volume);
      }
    });
    const currentTimeChecker = timer(0, 100).subscribe(x => {
      if (this._nativePlayer) {
        this.currentTimeChange.emit(this.currentTime);
      }
    });
    const durationChecker = timer(0, 100).subscribe(x => {
      if (this._nativePlayer) {
        this.durationChange.emit(this.duration);
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
        this.updateStatus(PlayerState.SDK_Loaded);
      };
      let js: HTMLScriptElement;
      const scripts = document.getElementsByTagName('script')[0];
      js = document.createElement('script');
      js.id = youtubeElId;
      js.src = '//www.youtube.com/iframe_api';
      scripts.parentNode.insertBefore(js, youtubeScriptEl);
    } else {
      this.updateStatus(PlayerState.SDK_Loaded);
    }
  }

  /**
   * DOM生成後初始化Youtube播放器
   */
  ngAfterViewInit(): void {
    this.updateStatus(PlayerState.DOMDone);
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }
  // #endregion

  // #region Private Methods
  private updateStatus(state: PlayerState): void {
    this._state = state;
    this.stateChange.emit(state);
  }

  private initPlayer() {
    this.element.nativeElement.id = uuid();
    const player = new YT.Player(this.element.nativeElement.id, {
      videoId: this.videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        controls: this._showControls ? 1 : 0,
        disablekb: this._enableKB ? 0 : 1,
        enablejsapi: 1,
        fs: this._showFullScreenButton ? 1 : 0,
        modestbranding: this._showYoutubeLogo ? 0 : 1,
        rel: this._showRelatedVideos ? 1 : 0,
        iv_load_policy: 3
      },
      events: {
        onReady: () => {
          this._nativePlayer = player;
          this.updateStatus(PlayerState.Ready);
          if (this._autoPlay) {
            this._nativePlayer.playVideo();
          }
          this._nativePlayer.setVolume(this._volume);
        },
        onError: error => {
          this.nativeError.emit(error);
        },
        onStateChange: change => {
          this.nativeStateChange.emit(change);
          this.nativeStateChangeEvent(change);
        }
      }
    });
  }

  private destroyPlayer() {
    if (this._nativePlayer) {
      this._nativePlayer.destroy();
    }
  }

  private nativeStateChangeEvent(change: YT.OnStateChangeEvent) {
    switch (change.data) {
      case YT.PlayerState.BUFFERING:
        this.updateStatus(PlayerState.Buffering);
        break;
      case YT.PlayerState.CUED:
        this.updateStatus(PlayerState.Cued);
        break;
      case YT.PlayerState.ENDED:
        this.updateStatus(PlayerState.Ended);
        if (this._loop) {
          this._nativePlayer.playVideo();
        }
        break;
      case YT.PlayerState.PAUSED:
        this.updateStatus(PlayerState.Paused);
        break;
      case YT.PlayerState.PLAYING:
        this.updateStatus(PlayerState.Playing);
        break;
      case YT.PlayerState.UNSTARTED:
        this.updateStatus(PlayerState.Unstarted);
        break;
    }
  }
  // #endregion

  public seekTo(time: number): void {
    if (this._nativePlayer) {
      this._nativePlayer.seekTo(time, true);
    }
  }

  public play(): void {
    if (this._nativePlayer) {
      this._nativePlayer.playVideo();
    }
  }

  public pause(): void {
    if (this._nativePlayer) {
      this._nativePlayer.pauseVideo();
    }
  }
}
