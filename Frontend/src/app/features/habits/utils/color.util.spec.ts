import { getColorWithOpacity } from "./color.util"

describe('color utils', () => {
    describe('getColorWithOpacity', () => {
        it('get 100% opacity color', () => {
            expect(getColorWithOpacity('#aa0000', 100)).toEqual('#aa0000ff')
        })
        
        it('get 50% opacity color', () => {
            expect(getColorWithOpacity('#aa00aa', 50)).toEqual('#aa00aa80')
        })
        
        it('get 0% opacity color', () => {
            expect(getColorWithOpacity('#0000aa', 0)).toEqual('#0000aa00')
        })
        
        it('get 1% opacity color', () => {
            expect(getColorWithOpacity('#aaa000', 1)).toEqual('#aaa00003')
        })
        
        it('get 6% opacity color', () => {
            expect(getColorWithOpacity('#ff0a0aff', 6)).toEqual('#ff0a0a0f')
        })
    })
})