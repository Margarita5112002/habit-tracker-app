import { Component, input, output } from "@angular/core";

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
    message = input('')
    confirm = output()
    cancel = output()

    onConfirmClick() {
        this.confirm.emit()
    }

    onCancelClick() {
        this.cancel.emit()
    }

}