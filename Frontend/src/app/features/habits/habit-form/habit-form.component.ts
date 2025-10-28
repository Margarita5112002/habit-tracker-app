import { ChangeDetectorRef, Component, inject } from "@angular/core";
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
        'name': ['', [Validators.required]],
        'description': [''],
        'color': ['#FF6B6B'],
        'target': [1],
        'frequency': ["1"],
        'frequencyCustom': [1, [Validators.min(1)]],
        'allowCustomValue': [true],
        'allowExceedTarget': [true],
    })

    showPicker = false
    emojiChose = '🤓'

    constructor(private cdr: ChangeDetectorRef){}

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

    onSubmit(event: SubmitEvent) {
        console.log("subtmit", this.form.value)
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