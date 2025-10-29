import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    imports: [RouterLink, RouterLinkActive, MatIconModule]
})
export class MenuComponent {

}