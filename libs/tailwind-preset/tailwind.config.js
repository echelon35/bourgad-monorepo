export const theme = {
    extend: {
        zIndex: {
            'map': '60',
            'on-map-1': '61',
            'on-map-2': '62',
            'sidebar': '200',
            'modal-bg': '899',
            'modal': '900',
            'modal-2': '901',
            'toastr': '999',
        },
        colors: {
            'primary-bourgad': '#264965',
            'primary-bourgad-2': '#5D8A9F',
        }
    }
};
export const plugins = [
    require('@tailwindcss/forms'),
];