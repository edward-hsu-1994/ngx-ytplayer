import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { YtPlayerModule } from './yt-player/yt-player.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, YtPlayerModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
