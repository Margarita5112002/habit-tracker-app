import { Component, forwardRef, model } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Color } from "./color.model";
import { COLORS } from "./colors";

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.css'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ColorPickerComponent),
        multi: true
    }]
})
export class ColorPickerComponent implements ControlValueAccessor {
    readonly COLORS = COLORS
    colorSelected = model<Color>(COLORS[0])
    disabled = model<boolean>(false)
    private onChange = (value: string) => { }
    private onTouched = () => { }

    chooseColor(color: Color) {
        this.writeValue(color.hexa)
        this.onChange(color.hexa)
        this.onTouched()
    }

    equalColors(c1: Color, c2: Color) {
        return c1.name == c2.name && c1.hexa == c2.hexa
    }

    // control value accessor methods
    writeValue(obj: string): void {
        const foundColor = COLORS.filter(c => c.hexa == obj)
        if (foundColor.length > 0) {
            this.colorSelected.set(foundColor[0])
        } else {
            this.colorSelected.set({
                name: 'custom',
                hexa: obj
            })
        }
    }
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled.set(isDisabled)
    }

}
