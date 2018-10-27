import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YtPlayerDirective } from './directives';

@NgModule({
  imports: [CommonModule],
  declarations: [YtPlayerDirective],
  exports: [YtPlayerDirective]
})
export class YtPlayerModule {}
