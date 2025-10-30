import { Component, computed, input } from "@angular/core";

@Component({
    selector: 'app-circular-progress-bar',
    templateUrl: './circular-progress-bar.component.html',
    styleUrl: './circular-progress-bar.component.css'
})
export class CircularProgressBarComponent {
    private readonly radius = 90;
    private readonly circumference = 2 * Math.PI * this.radius;

    percent = input(0.0)
    labelText = input("+")
    circleColor = input("#ff00ff")
    backgroundColor = input("#ff00ff20")
    progress = computed(() => Math.min(100, Math.max(0, this.percent())))

    strokeDashoffset = computed(() => 
        this.circumference - (this.progress() / 100) * this.circumference)
    
}