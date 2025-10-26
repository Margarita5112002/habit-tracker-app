import { ChangeDetectorRef, Component } from "@angular/core";
import { EmojiPickerComponent } from "../../../shared/emoji-picker/emoji-picker.component";

@Component({
    selector: 'app-habit-form',
    templateUrl: './habit-form.component.html',
    styleUrls: ['./habit-form.component.css'],
    imports: [EmojiPickerComponent]
})
export class HabitFormComponent {
    showPicker = false
    emojiChose = '🤓'

    constructor(private cdr: ChangeDetectorRef){}

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