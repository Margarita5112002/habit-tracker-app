import { Component, forwardRef, input, model, OnDestroy } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.css'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SwitchComponent),
        multi: true
    }],
    imports: [ReactiveFormsModule]
})
export class SwitchComponent implements OnDestroy, ControlValueAccessor {
    trueOption = input('option 1')
    falseOption = input('option 2')
    disabled = model<boolean>(false)
    formControl = new FormControl({value: this.trueOption(), disabled: this.disabled()})

    private onChange = (value: boolean) => { }
    private onTouched = () => { }
    private destroy$ = new Subject<void>()

    constructor() {
        this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
            next: value => {
                this.onChange(value == this.trueOption())
                this.onTouched()
            }
        })
    }

    get IsTrue() {
        return this.formControl.value == this.trueOption()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    // control value accessor methods
    writeValue(obj: boolean): void {
        this.formControl.setValue(obj ? this.trueOption() : this.falseOption())
    }
    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled.set(isDisabled)
        isDisabled ? this.formControl.disable() : this.formControl.enable()
    }
}