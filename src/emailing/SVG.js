const AxisButton = (
    <g>
        <rect x="1" y="1" width="48" height="48" rx="7" fill="white" strokeWidth="2"/>
        <circle cx="33" cy="17" r="3" stroke="none"/>
        <path d="M42.7071 37.7071C43.0976 37.3166 43.0976 36.6834 42.7071 36.2929L36.3431 29.9289C35.9526 29.5384 35.3195 29.5384 34.9289 29.9289C34.5384 30.3195 34.5384 30.9526 34.9289 31.3431L40.5858 37L34.9289 42.6569C34.5384 43.0474 34.5384 43.6805 34.9289 44.0711C35.3195 44.4616 35.9526 44.4616 36.3431 44.0711L42.7071 37.7071ZM14 38L42 38V36L14 36V38Z" stroke="none"/>
        <path d="M13.7071 8.29289C13.3166 7.90237 12.6834 7.90237 12.2929 8.29289L5.92893 14.6569C5.53841 15.0474 5.53841 15.6805 5.92893 16.0711C6.31946 16.4616 6.95262 16.4616 7.34314 16.0711L13 10.4142L18.6569 16.0711C19.0474 16.4616 19.6805 16.4616 20.0711 16.0711C20.4616 15.6805 20.4616 15.0474 20.0711 14.6569L13.7071 8.29289ZM14 38L14 9L12 9L12 38L14 38Z" stroke="none"/>
        <circle cx="21" cy="26" r="3" stroke="none"/>
    </g>
)

const SpaceButton = (
    <g>
        <rect x="1" y="1" width="48" height="48" rx="7" fill="white" strokeWidth="2"/>
        <circle cx="15" cy="26.25" r="5" stroke="none"/>
        <circle cx="33.75" cy="37.5" r="5" stroke="none"/>
        <circle cx="32.5" cy="13.75" r="5" stroke="none"/>
    </g>
)

const ListButton = (
    <g>
        <rect x="1" y="1" width="48" height="48" rx="7" fill="white" strokeWidth="2"/>
        <rect x="6.75" y="9.25" width="36.5" height="9" rx="1.5" />
        <rect x="6.75" y="20.5" width="36.5" height="9" rx="1.5" fill="white"/>
        <rect x="6.75" y="31.75" width="36.5" height="9" rx="1.5" fill="white"/>
    </g>
)

export {
    AxisButton,
    SpaceButton,
    ListButton
}