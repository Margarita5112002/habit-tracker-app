import { AfterViewInit, Component, ElementRef, output, ViewChild } from "@angular/core";
import { Picker } from "emoji-mart";

@Component({
    selector: 'app-emoji-picker',
    template: `<div #picker></div>`
})
export class EmojiPickerComponent implements AfterViewInit {
    @ViewChild('picker') pickerContainer!: ElementRef;
    onEmojiSelect = output<any>()
    onClickOutside = output()
    private picker = new Picker({
        data: async () => {
            const response = await fetch(
                'https://cdn.jsdelivr.net/npm/@emoji-mart/data',
            )

            return response.json()
        },
        onEmojiSelect: (emoji: any) => {
            this.onEmojiSelect.emit(emoji)
        },
        onClickOutside: () => {
            this.onClickOutside.emit()
        }
    })

    ngAfterViewInit(): void {
        this.pickerContainer.nativeElement.appendChild(this.picker);
    }
}