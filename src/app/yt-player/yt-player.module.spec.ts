import { YtPlayerModule } from './yt-player.module';

describe('YtPlayerModule', () => {
  let ytPlayerModule: YtPlayerModule;

  beforeEach(() => {
    ytPlayerModule = new YtPlayerModule();
  });

  it('should create an instance', () => {
    expect(ytPlayerModule).toBeTruthy();
  });
});
