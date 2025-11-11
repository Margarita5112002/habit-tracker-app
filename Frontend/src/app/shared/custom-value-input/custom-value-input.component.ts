import { NgStyle } from "@angular/common";
import { Component, computed, input, OnInit, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-custom-value-input',
    templateUrl: './custom-value-input.component.html',
    styleUrl: './custom-value-input.component.css',
    imports: [FormsModule, NgStyle]
})
export class CustomValueInputComponent implements OnInit{
    private readonly stepsOptions = [1, 5, 10, 50, 100]

    readonly title = input('title')
    readonly target = input(10)
    readonly min = input(0)
    readonly progressColor = input("#aa0000")
    readonly allowExceedTarget = input(true)
    readonly initialValue = input.required<number>()
    readonly value = signal(0)
    readonly stepAmount = signal(1)

    readonly onCloseClick = output<number>()

    readonly progress = computed(() => {
        const percentage = Math.round((this.value() / this.target()) * 100)
        return percentage > 100 ? 100 : percentage
    })
    readonly progressStyle = computed(() => {
        return {
            'background-color': this.progressColor(),
            'width': `${this.progress()}%`
        }
    })
    readonly chipStyle = computed(() => {
        const step = this.stepAmount()
        const i = this.stepsOptions.findIndex(s => s == step)
        const left = i < 0 ? 0 : i * 20
        return {
            'left': `${left}%`
        }
    })

    ngOnInit(): void {
        this.value.set(this.initialValue())
    }

    private changeValue(newval: number) {
        if (!this.allowExceedTarget() && newval > this.target()) {
            this.value.set(this.target())
            return
        }
        if (newval < this.min()) {
            this.value.set(this.min())
            return
        }
        this.value.set(newval)
    }

    onModalClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.close();
        }
    }

    close() {
        this.onCloseClick.emit(this.value())
    }

    plus() {
        const step = this.stepAmount()
        const val = this.value()
        const newval = Number(val) + Number(step)
        this.changeValue(newval)
    }

    minus() {
        const step = this.stepAmount()
        const val = this.value()
        const newval = Number(val) - Number(step)
        this.changeValue(newval)
    }

    reset() {
        this.value.set(this.min())
    }

    fillDay() {
        this.value.set(this.target())
    }
}