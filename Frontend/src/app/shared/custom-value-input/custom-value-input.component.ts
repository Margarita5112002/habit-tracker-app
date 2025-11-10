import { NgStyle } from "@angular/common";
import { Component, computed, effect, forwardRef, input, model, output } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: 'app-custom-value-input',
    templateUrl: './custom-value-input.component.html',
    styleUrl: './custom-value-input.component.css',
    imports: [FormsModule, NgStyle],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CustomValueInputComponent),
        multi: true
    }]
})
export class CustomValueInputComponent implements ControlValueAccessor {
    private readonly stepsOptions = [1, 5, 10, 50, 100]

    title = input('title')
    target = input(10)
    min = input(0)
    progressColor = input("#aa0000")
    allowExceedTarget = input(true)
    value = model(0)
    stepAmount = model(1)
    disabled = model<boolean>(false)
    onCloseClick = output()

    progress = computed(() => {
        const percentage = Math.round((this.value() / this.target()) * 100)
        return percentage > 100 ? 100 : percentage
    })
    progressStyle = computed(() => {
        return {
            'background-color': this.progressColor(),
            'width': `${this.progress()}%`
        }
    })
    chipStyle = computed(() => {
        const step = this.stepAmount()
        const i = this.stepsOptions.findIndex(s => s == step)
        const left = i < 0 ? 0 : i * 20
        return {
            'left': `${left}%`
        }
    })

    private onChange = (value: number) => { }
    private onTouched = () => { }

    constructor() {
        effect(() => {
            this.onChange(this.value())
        })
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
        const target = event.target
        if (!target) return
        if (target instanceof HTMLDivElement && target.className == "modal") {
            this.close()
        }
    }

    close() {
        this.onCloseClick.emit()
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

    /* control value accessor methods */
    writeValue(obj: number): void {
        this.changeValue(obj)
    }
    registerOnChange(fn: (value: number) => {}): void {
        this.onChange = fn
    }
    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled.set(isDisabled)
        // isDisabled ? this.formControl.disable() : this.formControl.enable()
    }

}