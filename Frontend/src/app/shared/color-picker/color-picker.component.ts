import { Component, forwardRef, model, output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

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
export class ColorPickerComponent implements ControlValueAccessor  {
    readonly COLORS: Color[] = [
        { name: 'Coral Red', hexa: '#FF6B6B' },
        { name: 'Pink', hexa: '#E91E63' },
        { name: 'Crimson', hexa: '#DC143C' },
        { name: 'Orange', hexa: '#FF8C42' },
        { name: 'Light Orange', hexa: '#FFA726' },
        { name: 'Gold', hexa: '#FFD700' },
        { name: 'Yellow', hexa: '#F4E04D' },
        { name: 'Emerald', hexa: '#2ECC71' },
        { name: 'Green', hexa: '#4CAF50' },
        { name: 'Bright Green', hexa: '#00C853' },
        { name: 'Teal', hexa: '#26A69A' },
        { name: 'Mint', hexa: '#90CAF9' },
        { name: 'Sky Blue', hexa: '#3498DB' },
        { name: 'Blue', hexa: '#2196F3' },
        { name: 'Ocean Blue', hexa: '#1976D2' },
        { name: 'Dark Blue', hexa: '#0D47A1' },
        { name: 'Cyan', hexa: '#00BCD4' },
        { name: 'Purple', hexa: '#9B59B6' },
        { name: 'Deep Purple', hexa: '#7E57C2' },
        { name: 'Orchid', hexa: '#BA68C8' },
        { name: 'Lavender', hexa: '#E1BEE7' },
        { name: 'Brown', hexa: '#8D6E63' },
        { name: 'Beige', hexa: '#D7CCC8' },
        { name: 'Gray', hexa: '#9E9E9E' },
        { name: 'Blue Gray', hexa: '#607D8B' },
        { name: 'Almost Black', hexa: '#212121' },
        { name: 'Dark Gray', hexa: '#424242' },
        { name: 'Light Gray', hexa: '#BDBDBD' },
        { name: 'Off White', hexa: '#F5F5F5' },
        { name: 'White', hexa: '#FFFFFF' }
    ];
    colorSelected = model<Color>(this.COLORS[0])
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
        const foundColor = this.COLORS.filter(c => c.hexa == obj)
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

interface Color {
    name: string,
    hexa: string
}