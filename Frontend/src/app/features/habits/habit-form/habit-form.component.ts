import { ChangeDetectorRef, Component, inject, output } from "@angular/core";
import { EmojiPickerComponent } from "../../../shared/emoji-picker/emoji-picker.component";
import { ColorPickerComponent } from "../../../shared/color-picker/color-picker.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { SwitchComponent } from "../../../shared/switch/switch.component";

@Component({
    selector: 'app-habit-form',
    templateUrl: './habit-form.component.html',
    styleUrls: ['./habit-form.component.css'],
    imports: [ReactiveFormsModule, EmojiPickerComponent, ColorPickerComponent, SwitchComponent]
})
export class HabitFormComponent {
    fb = inject(FormBuilder)
    form = this.fb.group({
        'name': ['', [Validators.required, Validators.maxLength(100)]],
        'description': ['', [Validators.maxLength(500)]],
        'color': ['#FF6B6B', [Validators.required]],
        'target': [1, [Validators.required, Validators.min(1)]],
        'frequency': ["1"],
        'frequencyCustom': [1, [Validators.required, Validators.min(1)]],
        'allowCustomValue': [true],
        'allowExceedTarget': [true],
    })
    onSubmitHabit = output<HabitSubmitted>()
    onCancel = output<void>()

    showPicker = false
    emojiChose = '🤓'

    constructor(private cdr: ChangeDetectorRef) { }

    get nameControl() {
        return this.form.controls.name
    }
    get descriptionControl() {
        return this.form.controls.description
    }
    get targetControl() {
        return this.form.controls.target
    }
    get frequencyCustomControl() {
        return this.form.controls.frequencyCustom
    }

    get allowCustomValue() {
        return this.form.value.allowCustomValue ?? false
    }
    get allowExceedTarget() {
        return this.form.value.allowExceedTarget ?? false
    }
    get selectedColor() {
        return this.form.value.color ?? "#ffffff"
    }

    get isFrequencyCustom() {
        const n = Number.parseInt(this.form.value.frequency ?? "")

        return Number.isNaN(n)
    }

    get emojiIsValid() {
        return this.emojiChose.length > 0 && this.emojiChose.length <= 10
    }

    get frequencyCustomIsValidIfSet() {
        return !this.isFrequencyCustom || (this.frequencyCustomControl.value ?? 0) >= 1
    }

    get formIsValid() {
        return this.form.valid && this.emojiIsValid && this.frequencyCustomIsValidIfSet
    }

    resetFrequencyCustom() {
        this.form.controls.frequencyCustom.setValue(1)
    }

    onClickCancel() {
        this.onCancel.emit()
    }

    onFormSubmit(event: SubmitEvent) {
        if (this.formIsValid) {
            const freqSelect = Number.parseInt(this.form.value.frequency ?? '1')
            const freq = Number.isNaN(freqSelect) ?
                this.form.value.frequencyCustom ?? 1 : freqSelect
            this.onSubmitHabit.emit({
                name: this.form.value.name ?? "",
                description: this.form.value.description ?? null,
                color: this.form.value.color ?? "#fff",
                emoji: this.emojiChose,
                target: this.form.value.target ?? 1,
                frequency: freq,
                allowCustomValue: this.form.value.allowCustomValue ?? false,
                allowExceedTarget: this.form.value.allowExceedTarget ?? false
            })
        }
    }

    togglePicker() {
        this.showPicker = !this.showPicker
    }

    onEmojiChange(data: any) {
        if (typeof data.native == 'string')
            this.emojiChose = data.native
        this.closeEmojiPicker()
    }

    closeEmojiPicker() {
        this.showPicker = false
        this.cdr.markForCheck()
    }

}

export interface HabitSubmitted {
    name: string,
    description: string | null,
    color: string,
    emoji: string,
    target: number,
    frequency: number,
    allowCustomValue: boolean,
    allowExceedTarget: boolean
}