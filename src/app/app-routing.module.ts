import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VideoComponent } from "./components/video/video.component";

const routes: Routes = [
  {
    component: VideoComponent,
    path: ""
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
