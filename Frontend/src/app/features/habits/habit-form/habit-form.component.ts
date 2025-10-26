import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { EmojiPickerComponent } from "../../../shared/emoji-picker/emoji-picker.component";
import { ColorPickerComponent } from "../../../shared/color-picker/color-picker.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: 'app-habit-form',
    templateUrl: './habit-form.component.html',
    styleUrls: ['./habit-form.component.css'],
    imports: [ReactiveFormsModule, EmojiPickerComponent, ColorPickerComponent]
})
export class HabitFormComponent {
    fb = inject(FormBuilder)
    form = this.fb.group({
        'name': ['', [Validators.required]],
        'color': ['#FF6B6B']
    })

    showPicker = false
    emojiChose = '🤓'

    constructor(private cdr: ChangeDetectorRef){}

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