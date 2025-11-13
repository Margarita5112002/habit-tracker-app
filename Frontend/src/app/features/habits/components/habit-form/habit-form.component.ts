import { ChangeDetectorRef, Component, inject, input, OnInit, output, signal } from "@angular/core";
import { EmojiPickerComponent } from "../../../../shared/emoji-picker/emoji-picker.component";
import { ColorPickerComponent } from "../../../../shared/color-picker/color-picker.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SwitchComponent } from "../../../../shared/switch/switch.component";
import { Habit } from "../../models/habit.model";

@Component({
    selector: 'app-habit-form',
    templateUrl: './habit-form.component.html',
    styleUrls: ['./habit-form.component.css'],
    imports: [ReactiveFormsModule, EmojiPickerComponent, ColorPickerComponent, SwitchComponent]
})
export class HabitFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder)
    private readonly cdr = inject(ChangeDetectorRef)
    form!: FormGroup

    readonly initialData = input<Habit>()
    readonly onSubmitHabit = output<Omit<Habit, 'id'>>()
    readonly onCancel = output<void>()
    readonly disabled = input(false)

    showPicker = signal(false)
    emojiChose = signal('🤓')

    ngOnInit(): void {
        this.initializeForm()
    }

    private initializeForm() {
        const data = this.initialData()
        const formData = {
            name: data ? data.name : '',
            description: data ? data.description : '',
            color: data ? data.color : "#FF6B6B",
            target: data ? data.target : 1,
            allowCustomValue: data ? data.allowCustomValue : true,
            allowExceedTarget: data ? data.allowExceedTarget : true,
            frequency: "1",
            frequencyCustom: 1
        }

        if (data?.frequencyInDays === 1 ||
            data?.frequencyInDays === 7 || 
            data?.frequencyInDays === 30
        ) {
            formData.frequency = data.frequencyInDays.toString()
        } else if (data){
            formData.frequency = "custom"
            formData.frequencyCustom = data.frequencyInDays
        } 

        if(data) this.emojiChose.set(data.emoji)

        this.form = this.fb.group({
            'name': [formData.name, [Validators.required, Validators.maxLength(100)]],
            'description': [formData.description, [Validators.maxLength(500)]],
            'color': [formData.color, [Validators.required]],
            'target': [formData.target, [Validators.required, Validators.min(1)]],
            'frequency': [formData.frequency],
            'frequencyCustom': [formData.frequencyCustom, [Validators.required, Validators.min(1)]],
            'allowCustomValue': [formData.allowCustomValue],
            'allowExceedTarget': [formData.allowExceedTarget],
        })
    }

    get nameControl() {
        return this.form.controls["name"]
    }
    get descriptionControl() {
        return this.form.controls["description"]
    }
    get targetControl() {
        return this.form.controls["target"]
    }
    get frequencyCustomControl() {
        return this.form.controls["frequencyCustom"]
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
        return this.emojiChose().length > 0 && this.emojiChose().length <= 10
    }

    get frequencyCustomIsValidIfSet() {
        return !this.isFrequencyCustom || (this.frequencyCustomControl.value ?? 0) >= 1
    }

    get formIsValid() {
        return this.form.valid && this.emojiIsValid && this.frequencyCustomIsValidIfSet
    }

    resetFrequencyCustom() {
        this.form.controls["frequencyCustom"].setValue(1)
    }

    onClickCancel() {
        this.onCancel.emit()
    }

    onFormSubmit(event: SubmitEvent) {
        if (this.formIsValid && !this.disabled()) {
            const freqSelect = Number.parseInt(this.form.value.frequency ?? '1')
            const freq = Number.isNaN(freqSelect) ?
                this.form.value.frequencyCustom ?? 1 : freqSelect
            this.onSubmitHabit.emit({
                name: this.form.value.name ?? "",
                description: this.form.value.description ?? null,
                color: this.form.value.color ?? "#fff",
                emoji: this.emojiChose(),
                target: this.form.value.target ?? 1,
                frequencyInDays: freq,
                allowCustomValue: this.form.value.allowCustomValue ?? false,
                allowExceedTarget: this.form.value.allowExceedTarget ?? false
            })
        }
    }

    togglePicker() {
        this.showPicker.set(!this.showPicker())
    }

    onEmojiChange(data: any) {
        if (typeof data.native == 'string')
            this.emojiChose.set(data.native)
        this.closeEmojiPicker()
    }

    closeEmojiPicker() {
        this.showPicker.set(false)
        this.cdr.markForCheck()
    }

}