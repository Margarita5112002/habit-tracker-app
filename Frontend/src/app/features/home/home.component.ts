import { Component } from "@angular/core";
import { MenuComponent } from "./menu/menu.component";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [MenuComponent, RouterOutlet]
})
export class HomeComponent {
    
}