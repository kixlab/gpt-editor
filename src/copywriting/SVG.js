const ListSmall = (
    <g data-type="lens">
        <g filter="url(#svg-shadow)" data-type="lens">
            <path d="M4 0H54V50H4V0Z" fill="white" data-type="lens"/>
            <path d="M5 1H53V49H5V1Z" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens" />
        </g>
        <rect x="10" y="9" width="38" height="10" rx="2" fill="#0066FF" fillOpacity="0.2" data-type="lens" />
        <rect x="10.5" y="9.5" width="37" height="9" rx="1.5" fill="#0066FF" fillOpacity="0.2" stroke="#0066FF" strokeOpacity="0.3" data-type="lens"/>
        <rect x="10" y="20" width="38" height="10" rx="2" fill="white" data-type="lens"/>
        <rect x="10.5" y="20.5" width="37" height="9" rx="1.5" fill="#fff" stroke="#0066FF" strokeOpacity="0.3" data-type="lens"/>
        <rect x="10" y="31" width="38" height="10" rx="2" fill="white" data-type="lens"/>
        <rect x="10.5" y="31.5" width="37" height="9" rx="1.5" fill="#fff" stroke="#0066FF" strokeOpacity="0.3" data-type="lens"/>
    </g>
)
const SpaceSmall = (
    <g data-type="lens">
        <g filter="url(#svg-shadow)" data-type="lens">
            <rect x="4" width="50" height="50" rx="8" fill="white" data-type="lens"/>
            <rect x="5" y="1" width="48" height="48" rx="7" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens"/>
        </g>
        <circle cx="19" cy="26.25" r="5" fill="#0066FF" fillOpacity="0.5" data-type="lens" />
        <circle cx="37.75" cy="37.5" r="5" fill="#0066FF" fillOpacity="0.5" data-type="lens"/>
        <circle cx="36.5" cy="13.75" r="5" fill="#0066FF" fillOpacity="0.5" data-type="lens"/>
    </g>
);
const PeekSmall = (
    <g data-type="lens">
        <g filter="url(#svg-shadow)" data-type="lens">
            <path d="M4 0H46C50.4183 0 54 3.58172 54 8V50H12C7.58172 50 4 46.4183 4 42V0Z" fill="#fff" data-type="lens"/>
            <path d="M5 1H46C49.866 1 53 4.13401 53 8V49H12C8.13401 49 5 45.866 5 42V1Z" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens"/>
        </g>
        <path d="M16.4473 13.2119H14.5479V12.4453H16.4473C16.8151 12.4453 17.113 12.3867 17.3408 12.2695C17.5687 12.1523 17.7347 11.9896 17.8389 11.7812C17.9463 11.5729 18 11.3353 18 11.0684C18 10.8242 17.9463 10.5947 17.8389 10.3799C17.7347 10.165 17.5687 9.99251 17.3408 9.8623C17.113 9.72884 16.8151 9.66211 16.4473 9.66211H14.7676V16H13.8252V8.89062H16.4473C16.9844 8.89062 17.4385 8.9834 17.8096 9.16895C18.1807 9.35449 18.4622 9.61165 18.6543 9.94043C18.8464 10.266 18.9424 10.6387 18.9424 11.0586C18.9424 11.5143 18.8464 11.9033 18.6543 12.2256C18.4622 12.5479 18.1807 12.7936 17.8096 12.9629C17.4385 13.1289 16.9844 13.2119 16.4473 13.2119ZM22.1211 16.0977C21.7533 16.0977 21.4196 16.0358 21.1201 15.9121C20.8239 15.7852 20.5684 15.6077 20.3535 15.3799C20.1419 15.152 19.9792 14.8818 19.8652 14.5693C19.7513 14.2568 19.6943 13.915 19.6943 13.5439V13.3389C19.6943 12.9092 19.7578 12.5267 19.8848 12.1914C20.0117 11.8529 20.1842 11.5664 20.4023 11.332C20.6204 11.0977 20.8678 10.9202 21.1445 10.7998C21.4212 10.6794 21.7077 10.6191 22.0039 10.6191C22.3815 10.6191 22.707 10.6842 22.9805 10.8145C23.2572 10.9447 23.4834 11.127 23.6592 11.3613C23.835 11.5924 23.9652 11.8659 24.0498 12.1816C24.1344 12.4941 24.1768 12.8359 24.1768 13.207V13.6123H20.2314V12.875H23.2734V12.8066C23.2604 12.5723 23.2116 12.3444 23.127 12.123C23.0456 11.9017 22.9154 11.7194 22.7363 11.5762C22.5573 11.4329 22.3132 11.3613 22.0039 11.3613C21.7988 11.3613 21.61 11.4053 21.4375 11.4932C21.265 11.5778 21.1169 11.7048 20.9932 11.874C20.8695 12.0433 20.7734 12.25 20.7051 12.4941C20.6367 12.7383 20.6025 13.0199 20.6025 13.3389V13.5439C20.6025 13.7946 20.6367 14.0306 20.7051 14.252C20.7767 14.4701 20.8792 14.6621 21.0127 14.8281C21.1494 14.9941 21.3138 15.1243 21.5059 15.2188C21.7012 15.3132 21.9225 15.3604 22.1699 15.3604C22.4889 15.3604 22.7591 15.2952 22.9805 15.165C23.2018 15.0348 23.3955 14.8607 23.5615 14.6426L24.1084 15.0771C23.9945 15.2497 23.8496 15.4141 23.6738 15.5703C23.498 15.7266 23.2816 15.8535 23.0244 15.9512C22.7705 16.0488 22.4694 16.0977 22.1211 16.0977ZM27.4238 16.0977C27.056 16.0977 26.7223 16.0358 26.4229 15.9121C26.1266 15.7852 25.8711 15.6077 25.6562 15.3799C25.4447 15.152 25.2819 14.8818 25.168 14.5693C25.054 14.2568 24.9971 13.915 24.9971 13.5439V13.3389C24.9971 12.9092 25.0605 12.5267 25.1875 12.1914C25.3145 11.8529 25.487 11.5664 25.7051 11.332C25.9232 11.0977 26.1706 10.9202 26.4473 10.7998C26.724 10.6794 27.0104 10.6191 27.3066 10.6191C27.6842 10.6191 28.0098 10.6842 28.2832 10.8145C28.5599 10.9447 28.7861 11.127 28.9619 11.3613C29.1377 11.5924 29.2679 11.8659 29.3525 12.1816C29.4372 12.4941 29.4795 12.8359 29.4795 13.207V13.6123H25.5342V12.875H28.5762V12.8066C28.5632 12.5723 28.5143 12.3444 28.4297 12.123C28.3483 11.9017 28.2181 11.7194 28.0391 11.5762C27.86 11.4329 27.6159 11.3613 27.3066 11.3613C27.1016 11.3613 26.9128 11.4053 26.7402 11.4932C26.5677 11.5778 26.4196 11.7048 26.2959 11.874C26.1722 12.0433 26.0762 12.25 26.0078 12.4941C25.9395 12.7383 25.9053 13.0199 25.9053 13.3389V13.5439C25.9053 13.7946 25.9395 14.0306 26.0078 14.252C26.0794 14.4701 26.182 14.6621 26.3154 14.8281C26.4521 14.9941 26.6165 15.1243 26.8086 15.2188C27.0039 15.3132 27.2253 15.3604 27.4727 15.3604C27.7917 15.3604 28.0618 15.2952 28.2832 15.165C28.5046 15.0348 28.6982 14.8607 28.8643 14.6426L29.4111 15.0771C29.2972 15.2497 29.1523 15.4141 28.9766 15.5703C28.8008 15.7266 28.5843 15.8535 28.3271 15.9512C28.0732 16.0488 27.7721 16.0977 27.4238 16.0977ZM31.4424 8.5V16H30.5342V8.5H31.4424ZM34.6699 10.7168L32.3652 13.1826L31.0762 14.5205L31.0029 13.5586L31.9258 12.4551L33.5664 10.7168H34.6699ZM33.8447 16L31.96 13.4805L32.4287 12.6748L34.9092 16H33.8447Z" fill="#0066FF" fillOpacity="0.8" data-type="lens"/>
        <path d="M28.4199 19.4668V24.75H27.5117V19.4668H28.4199ZM27.4434 18.0654C27.4434 17.9189 27.4873 17.7952 27.5752 17.6943C27.6663 17.5934 27.7998 17.543 27.9756 17.543C28.1481 17.543 28.2799 17.5934 28.3711 17.6943C28.4655 17.7952 28.5127 17.9189 28.5127 18.0654C28.5127 18.2054 28.4655 18.3258 28.3711 18.4268C28.2799 18.5244 28.1481 18.5732 27.9756 18.5732C27.7998 18.5732 27.6663 18.5244 27.5752 18.4268C27.4873 18.3258 27.4434 18.2054 27.4434 18.0654ZM30.7734 20.5947V24.75H29.8701V19.4668H30.7246L30.7734 20.5947ZM30.5586 21.9082L30.1826 21.8936C30.1859 21.5322 30.2396 21.1986 30.3438 20.8926C30.4479 20.5833 30.5944 20.3148 30.7832 20.0869C30.972 19.859 31.1966 19.6833 31.457 19.5596C31.7207 19.4326 32.012 19.3691 32.3311 19.3691C32.5915 19.3691 32.8258 19.4049 33.0342 19.4766C33.2425 19.5449 33.4199 19.6556 33.5664 19.8086C33.7161 19.9616 33.8301 20.1602 33.9082 20.4043C33.9863 20.6452 34.0254 20.9398 34.0254 21.2881V24.75H33.1172V21.2783C33.1172 21.0016 33.0765 20.7803 32.9951 20.6143C32.9137 20.445 32.7949 20.3229 32.6387 20.248C32.4824 20.1699 32.2904 20.1309 32.0625 20.1309C31.8379 20.1309 31.6328 20.1781 31.4473 20.2725C31.265 20.3669 31.1071 20.4971 30.9736 20.6631C30.8434 20.8291 30.7409 21.0195 30.666 21.2344C30.5944 21.446 30.5586 21.6706 30.5586 21.9082ZM37.6094 19.4668V20.1602H34.7529V19.4668H37.6094ZM35.7197 18.1826H36.623V23.4414C36.623 23.6204 36.6507 23.7555 36.7061 23.8467C36.7614 23.9378 36.833 23.998 36.9209 24.0273C37.0088 24.0566 37.1032 24.0713 37.2041 24.0713C37.279 24.0713 37.3571 24.0648 37.4385 24.0518C37.5231 24.0355 37.5866 24.0225 37.6289 24.0127L37.6338 24.75C37.5622 24.7728 37.4678 24.7939 37.3506 24.8135C37.2367 24.8363 37.0983 24.8477 36.9355 24.8477C36.7142 24.8477 36.5107 24.8037 36.3252 24.7158C36.1396 24.6279 35.9915 24.4814 35.8809 24.2764C35.7734 24.068 35.7197 23.7881 35.7197 23.4365V18.1826ZM38.332 22.167V22.0547C38.332 21.6738 38.3874 21.3206 38.498 20.9951C38.6087 20.6663 38.7682 20.3815 38.9766 20.1406C39.1849 19.8965 39.4372 19.7077 39.7334 19.5742C40.0296 19.4375 40.3617 19.3691 40.7295 19.3691C41.1006 19.3691 41.4342 19.4375 41.7305 19.5742C42.0299 19.7077 42.2839 19.8965 42.4922 20.1406C42.7038 20.3815 42.8649 20.6663 42.9756 20.9951C43.0863 21.3206 43.1416 21.6738 43.1416 22.0547V22.167C43.1416 22.5479 43.0863 22.901 42.9756 23.2266C42.8649 23.5521 42.7038 23.8369 42.4922 24.0811C42.2839 24.3219 42.0316 24.5107 41.7354 24.6475C41.4424 24.7809 41.1104 24.8477 40.7393 24.8477C40.3682 24.8477 40.0345 24.7809 39.7383 24.6475C39.4421 24.5107 39.1882 24.3219 38.9766 24.0811C38.7682 23.8369 38.6087 23.5521 38.498 23.2266C38.3874 22.901 38.332 22.5479 38.332 22.167ZM39.2354 22.0547V22.167C39.2354 22.4307 39.2663 22.6797 39.3281 22.9141C39.39 23.1452 39.4827 23.3503 39.6064 23.5293C39.7334 23.7083 39.8913 23.8499 40.0801 23.9541C40.2689 24.055 40.4886 24.1055 40.7393 24.1055C40.9867 24.1055 41.2031 24.055 41.3887 23.9541C41.5775 23.8499 41.7337 23.7083 41.8574 23.5293C41.9811 23.3503 42.0739 23.1452 42.1357 22.9141C42.2008 22.6797 42.2334 22.4307 42.2334 22.167V22.0547C42.2334 21.7943 42.2008 21.5485 42.1357 21.3174C42.0739 21.083 41.9795 20.8763 41.8525 20.6973C41.7288 20.515 41.5726 20.3717 41.3838 20.2676C41.1982 20.1634 40.9801 20.1113 40.7295 20.1113C40.4821 20.1113 40.264 20.1634 40.0752 20.2676C39.8896 20.3717 39.7334 20.515 39.6064 20.6973C39.4827 20.8763 39.39 21.083 39.3281 21.3174C39.2663 21.5485 39.2354 21.7943 39.2354 22.0547Z" fill="#0066FF" fillOpacity="0.6" data-type="lens"/>
        <path d="M15.9004 25.7168V26.4102H13.0439V25.7168H15.9004ZM14.0107 24.4326H14.9141V29.6914C14.9141 29.8704 14.9417 30.0055 14.9971 30.0967C15.0524 30.1878 15.124 30.248 15.2119 30.2773C15.2998 30.3066 15.3942 30.3213 15.4951 30.3213C15.57 30.3213 15.6481 30.3148 15.7295 30.3018C15.8141 30.2855 15.8776 30.2725 15.9199 30.2627L15.9248 31C15.8532 31.0228 15.7588 31.0439 15.6416 31.0635C15.5277 31.0863 15.3893 31.0977 15.2266 31.0977C15.0052 31.0977 14.8018 31.0537 14.6162 30.9658C14.4307 30.8779 14.2826 30.7314 14.1719 30.5264C14.0645 30.318 14.0107 30.0381 14.0107 29.6865V24.4326ZM17.8633 23.5V31H16.96V23.5H17.8633ZM17.6484 28.1582L17.2725 28.1436C17.2757 27.7822 17.3294 27.4486 17.4336 27.1426C17.5378 26.8333 17.6842 26.5648 17.873 26.3369C18.0618 26.109 18.2865 25.9333 18.5469 25.8096C18.8105 25.6826 19.1019 25.6191 19.4209 25.6191C19.6813 25.6191 19.9157 25.6549 20.124 25.7266C20.3324 25.7949 20.5098 25.9056 20.6562 26.0586C20.806 26.2116 20.9199 26.4102 20.998 26.6543C21.0762 26.8952 21.1152 27.1898 21.1152 27.5381V31H20.207V27.5283C20.207 27.2516 20.1663 27.0303 20.085 26.8643C20.0036 26.695 19.8848 26.5729 19.7285 26.498C19.5723 26.4199 19.3802 26.3809 19.1523 26.3809C18.9277 26.3809 18.7227 26.4281 18.5371 26.5225C18.3548 26.6169 18.1969 26.7471 18.0635 26.9131C17.9333 27.0791 17.8307 27.2695 17.7559 27.4844C17.6842 27.696 17.6484 27.9206 17.6484 28.1582ZM24.6602 31.0977C24.2923 31.0977 23.9587 31.0358 23.6592 30.9121C23.363 30.7852 23.1074 30.6077 22.8926 30.3799C22.681 30.152 22.5182 29.8818 22.4043 29.5693C22.2904 29.2568 22.2334 28.915 22.2334 28.5439V28.3389C22.2334 27.9092 22.2969 27.5267 22.4238 27.1914C22.5508 26.8529 22.7233 26.5664 22.9414 26.332C23.1595 26.0977 23.4069 25.9202 23.6836 25.7998C23.9603 25.6794 24.2467 25.6191 24.543 25.6191C24.9206 25.6191 25.2461 25.6842 25.5195 25.8145C25.7962 25.9447 26.0225 26.127 26.1982 26.3613C26.374 26.5924 26.5042 26.8659 26.5889 27.1816C26.6735 27.4941 26.7158 27.8359 26.7158 28.207V28.6123H22.7705V27.875H25.8125V27.8066C25.7995 27.5723 25.7507 27.3444 25.666 27.123C25.5846 26.9017 25.4544 26.7194 25.2754 26.5762C25.0964 26.4329 24.8522 26.3613 24.543 26.3613C24.3379 26.3613 24.1491 26.4053 23.9766 26.4932C23.804 26.5778 23.6559 26.7048 23.5322 26.874C23.4085 27.0433 23.3125 27.25 23.2441 27.4941C23.1758 27.7383 23.1416 28.0199 23.1416 28.3389V28.5439C23.1416 28.7946 23.1758 29.0306 23.2441 29.252C23.3158 29.4701 23.4183 29.6621 23.5518 29.8281C23.6885 29.9941 23.8529 30.1243 24.0449 30.2188C24.2402 30.3132 24.4616 30.3604 24.709 30.3604C25.028 30.3604 25.2982 30.2952 25.5195 30.165C25.7409 30.0348 25.9346 29.8607 26.1006 29.6426L26.6475 30.0771C26.5335 30.2497 26.3887 30.4141 26.2129 30.5703C26.0371 30.7266 25.8206 30.8535 25.5635 30.9512C25.3096 31.0488 25.0085 31.0977 24.6602 31.0977Z" fill="#0066FF" fillOpacity="0.4" data-type="lens"/>
        <path d="M18.7861 39.75H17.8828V33.9102C17.8828 33.5293 17.9512 33.2087 18.0879 32.9482C18.2279 32.6846 18.4281 32.486 18.6885 32.3525C18.9489 32.2158 19.2581 32.1475 19.6162 32.1475C19.7204 32.1475 19.8245 32.154 19.9287 32.167C20.0361 32.18 20.1403 32.1995 20.2412 32.2256L20.1924 32.9629C20.124 32.9466 20.0459 32.9352 19.958 32.9287C19.8734 32.9222 19.7887 32.9189 19.7041 32.9189C19.512 32.9189 19.346 32.958 19.2061 33.0361C19.0693 33.111 18.9652 33.2217 18.8936 33.3682C18.8219 33.5146 18.7861 33.6953 18.7861 33.9102V39.75ZM19.9092 34.4668V35.1602H17.0479V34.4668H19.9092ZM24.1475 38.5293V34.4668H25.0557V39.75H24.1914L24.1475 38.5293ZM24.3184 37.416L24.6943 37.4062C24.6943 37.7578 24.6569 38.0833 24.582 38.3828C24.5104 38.679 24.3932 38.9362 24.2305 39.1543C24.0677 39.3724 23.8545 39.5433 23.5908 39.667C23.3271 39.7874 23.0065 39.8477 22.6289 39.8477C22.3717 39.8477 22.1357 39.8102 21.9209 39.7354C21.7093 39.6605 21.527 39.5449 21.374 39.3887C21.221 39.2324 21.1022 39.029 21.0176 38.7783C20.9362 38.5277 20.8955 38.2266 20.8955 37.875V34.4668H21.7988V37.8848C21.7988 38.1224 21.8249 38.3193 21.877 38.4756C21.9323 38.6286 22.0055 38.7507 22.0967 38.8418C22.1911 38.9297 22.2952 38.9915 22.4092 39.0273C22.5264 39.0632 22.6468 39.0811 22.7705 39.0811C23.1546 39.0811 23.459 39.0078 23.6836 38.8613C23.9082 38.7116 24.0693 38.5114 24.167 38.2607C24.2679 38.0068 24.3184 37.7253 24.3184 37.416ZM28.6445 34.4668V35.1602H25.7881V34.4668H28.6445ZM26.7549 33.1826H27.6582V38.4414C27.6582 38.6204 27.6859 38.7555 27.7412 38.8467C27.7965 38.9378 27.8682 38.998 27.9561 39.0273C28.0439 39.0566 28.1383 39.0713 28.2393 39.0713C28.3141 39.0713 28.3923 39.0648 28.4736 39.0518C28.5583 39.0355 28.6217 39.0225 28.6641 39.0127L28.6689 39.75C28.5973 39.7728 28.5029 39.7939 28.3857 39.8135C28.2718 39.8363 28.1335 39.8477 27.9707 39.8477C27.7493 39.8477 27.5459 39.8037 27.3604 39.7158C27.1748 39.6279 27.0267 39.4814 26.916 39.2764C26.8086 39.068 26.7549 38.7881 26.7549 38.4365V33.1826ZM32.9365 38.5293V34.4668H33.8447V39.75H32.9805L32.9365 38.5293ZM33.1074 37.416L33.4834 37.4062C33.4834 37.7578 33.446 38.0833 33.3711 38.3828C33.2995 38.679 33.1823 38.9362 33.0195 39.1543C32.8568 39.3724 32.6436 39.5433 32.3799 39.667C32.1162 39.7874 31.7956 39.8477 31.418 39.8477C31.1608 39.8477 30.9248 39.8102 30.71 39.7354C30.4984 39.6605 30.3161 39.5449 30.1631 39.3887C30.0101 39.2324 29.8913 39.029 29.8066 38.7783C29.7253 38.5277 29.6846 38.2266 29.6846 37.875V34.4668H30.5879V37.8848C30.5879 38.1224 30.6139 38.3193 30.666 38.4756C30.7214 38.6286 30.7946 38.7507 30.8857 38.8418C30.9801 38.9297 31.0843 38.9915 31.1982 39.0273C31.3154 39.0632 31.4359 39.0811 31.5596 39.0811C31.9437 39.0811 32.248 39.0078 32.4727 38.8613C32.6973 38.7116 32.8584 38.5114 32.9561 38.2607C33.057 38.0068 33.1074 37.7253 33.1074 37.416ZM36.125 35.2969V39.75H35.2217V34.4668H36.1006L36.125 35.2969ZM37.7754 34.4375L37.7705 35.2773C37.6956 35.2611 37.624 35.2513 37.5557 35.248C37.4906 35.2415 37.4157 35.2383 37.3311 35.2383C37.1227 35.2383 36.9388 35.2708 36.7793 35.3359C36.6198 35.401 36.4847 35.4922 36.374 35.6094C36.2633 35.7266 36.1755 35.8665 36.1104 36.0293C36.0485 36.1888 36.0078 36.3646 35.9883 36.5566L35.7344 36.7031C35.7344 36.3841 35.7653 36.0846 35.8271 35.8047C35.8923 35.5247 35.9915 35.2773 36.125 35.0625C36.2585 34.8444 36.4277 34.6751 36.6328 34.5547C36.8411 34.431 37.0885 34.3691 37.375 34.3691C37.4401 34.3691 37.515 34.3773 37.5996 34.3936C37.6842 34.4066 37.7428 34.4212 37.7754 34.4375ZM40.7051 39.8477C40.3372 39.8477 40.0036 39.7858 39.7041 39.6621C39.4079 39.5352 39.1523 39.3577 38.9375 39.1299C38.7259 38.902 38.5632 38.6318 38.4492 38.3193C38.3353 38.0068 38.2783 37.665 38.2783 37.2939V37.0889C38.2783 36.6592 38.3418 36.2767 38.4688 35.9414C38.5957 35.6029 38.7682 35.3164 38.9863 35.082C39.2044 34.8477 39.4518 34.6702 39.7285 34.5498C40.0052 34.4294 40.2917 34.3691 40.5879 34.3691C40.9655 34.3691 41.291 34.4342 41.5645 34.5645C41.8411 34.6947 42.0674 34.877 42.2432 35.1113C42.4189 35.3424 42.5492 35.6159 42.6338 35.9316C42.7184 36.2441 42.7607 36.5859 42.7607 36.957V37.3623H38.8154V36.625H41.8574V36.5566C41.8444 36.3223 41.7956 36.0944 41.7109 35.873C41.6296 35.6517 41.4993 35.4694 41.3203 35.3262C41.1413 35.1829 40.8971 35.1113 40.5879 35.1113C40.3828 35.1113 40.194 35.1553 40.0215 35.2432C39.849 35.3278 39.7008 35.4548 39.5771 35.624C39.4535 35.7933 39.3574 36 39.2891 36.2441C39.2207 36.4883 39.1865 36.7699 39.1865 37.0889V37.2939C39.1865 37.5446 39.2207 37.7806 39.2891 38.002C39.3607 38.2201 39.4632 38.4121 39.5967 38.5781C39.7334 38.7441 39.8978 38.8743 40.0898 38.9688C40.2852 39.0632 40.5065 39.1104 40.7539 39.1104C41.0729 39.1104 41.3431 39.0452 41.5645 38.915C41.7858 38.7848 41.9795 38.6107 42.1455 38.3926L42.6924 38.8271C42.5785 38.9997 42.4336 39.1641 42.2578 39.3203C42.082 39.4766 41.8656 39.6035 41.6084 39.7012C41.3545 39.7988 41.0534 39.8477 40.7051 39.8477Z" fill="#0066FF" fillOpacity="0.2" data-type="lens"/>
    </g>
);
const ListBig = (
    <g filter="url(#svg-shadow)">
        <rect x="4" width="224" height="224" fill="white" />
        <rect x="5" y="1" width="222" height="222" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens" />
    </g>
);
const SpaceBig = (
    <g filter="url(#svg-shadow)" data-type="lens">
        <rect x="4" width="224" height="224" rx="20" fill="white" data-type="lens"/>
        <rect x="5" y="1" width="222" height="222" rx="19" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens"/>
    </g>
);
const PeekBig = (
    <g filter="url(#svg-shadow)">
        <path d="M4 0H208C219.046 0 228 8.95431 228 20V224H24C12.9543 224 4 215.046 4 204V0Z" fill="white" />
        <path d="M5 1H208C218.493 1 227 9.50659 227 20V223H24C13.5066 223 5 214.493 5 204V1Z" fill="#fff" stroke="#0066FF" strokeWidth="2" data-type="lens" />
    </g>
);
const Collapse = (
    <g>
        <path d="M1 8V5C1 2.79086 2.79086 1 5 1H13C15.2091 1 17 2.79086 17 5V13C17 15.2091 15.2091 17 13 17H10" strokeWidth="2" strokeLinecap="round" fill="#fff"/>
        <path d="M14.9537 3.93168C15.1489 3.73642 15.1489 3.41983 14.9537 3.22457C14.7584 3.02931 14.4418 3.02931 14.2465 3.22457L14.9537 3.93168ZM9.3001 8.37812C9.3001 8.65427 9.52395 8.87812 9.8001 8.87812L14.3001 8.87812C14.5762 8.87812 14.8001 8.65427 14.8001 8.37812C14.8001 8.10198 14.5762 7.87812 14.3001 7.87812L10.3001 7.87812L10.3001 3.87812C10.3001 3.60198 10.0762 3.37812 9.8001 3.37812C9.52396 3.37812 9.3001 3.60198 9.3001 3.87812L9.3001 8.37812ZM14.2465 3.22457L9.44654 8.02457L10.1537 8.73168L14.9537 3.93168L14.2465 3.22457Z"/>
        <rect x="1" y="9.7998" width="7.2" height="7.2" rx="2" strokeWidth="2" fill="#fff"/>
    </g>
)
const SpaceButton = (
    <g>
        <rect x="1" y="1" width="16" height="16" rx="3" fill="white" strokeWidth="2"/>
        <circle cx="5.5" cy="12.5" r="2.5" stroke="none"/>
        <circle cx="12.5" cy="9.5" r="2.5" stroke="none"/>
        <circle cx="6.5" cy="5.5" r="2.5" stroke="none"/>
    </g>
)
const ListButton = (
    <g>
        <rect x="1" y="1" width="16" height="16" rx="3" fill="white" strokeWidth="2"/>
        <rect x="3.5" y="5.5" width="11" height="1" rx="0.5"/>
        <rect x="3.5" y="8.5" width="11" height="1" rx="0.5"/>
        <rect x="3.5" y="11.5" width="11" height="1" rx="0.5"/>
    </g>
)

const NewSpaceButton = (
    <g>
        <path d="M24.25 1H6.75C3.85051 1 1.5 3.35051 1.5 6.25V23.75C1.5 26.6495 3.85051 29 6.75 29H24.25C27.1495 29 29.5 26.6495 29.5 23.75V6.25C29.5 3.35051 27.1495 1 24.25 1Z" fill="white" strokeWidth="2"/>
        <path d="M9.375 25.5C11.7912 25.5 13.75 23.5412 13.75 21.125C13.75 18.7088 11.7912 16.75 9.375 16.75C6.95875 16.75 5 18.7088 5 21.125C5 23.5412 6.95875 25.5 9.375 25.5Z" />
        <path d="M21.625 20.25C24.0412 20.25 26 18.2912 26 15.875C26 13.4588 24.0412 11.5 21.625 11.5C19.2088 11.5 17.25 13.4588 17.25 15.875C17.25 18.2912 19.2088 20.25 21.625 20.25Z" />
        <path d="M11.125 13.25C13.5412 13.25 15.5 11.2912 15.5 8.875C15.5 6.45875 13.5412 4.5 11.125 4.5C8.70875 4.5 6.75 6.45875 6.75 8.875C6.75 11.2912 8.70875 13.25 11.125 13.25Z" />
    </g>
);
const NewListButton = (
    <g>
        <path d="M24.25 1H6.75C3.85051 1 1.5 3.35051 1.5 6.25V23.75C1.5 26.6495 3.85051 29 6.75 29H24.25C27.1495 29 29.5 26.6495 29.5 23.75V6.25C29.5 3.35051 27.1495 1 24.25 1Z" fill="white" strokeWidth="2"/>
        <path d="M24.25 8.875H6.75C6.26675 8.875 5.875 9.26675 5.875 9.75C5.875 10.2332 6.26675 10.625 6.75 10.625H24.25C24.7332 10.625 25.125 10.2332 25.125 9.75C25.125 9.26675 24.7332 8.875 24.25 8.875Z" />
        <path d="M24.25 14.125H6.75C6.26675 14.125 5.875 14.5168 5.875 15C5.875 15.4832 6.26675 15.875 6.75 15.875H24.25C24.7332 15.875 25.125 15.4832 25.125 15C25.125 14.5168 24.7332 14.125 24.25 14.125Z" />
        <path d="M24.25 19.375H6.75C6.26675 19.375 5.875 19.7668 5.875 20.25C5.875 20.7332 6.26675 21.125 6.75 21.125H24.25C24.7332 21.125 25.125 20.7332 25.125 20.25C25.125 19.7668 24.7332 19.375 24.25 19.375Z" />
    </g>
);
const SentimentButton = (
    <g>
        <path d="M23.75 1H6.25C3.35051 1 1 3.35051 1 6.25V23.75C1 26.6495 3.35051 29 6.25 29H23.75C26.6495 29 29 26.6495 29 23.75V6.25C29 3.35051 26.6495 1 23.75 1Z" strokeWidth="2" fill="#fff"/>
        <rect x="9" y="5" width="2" height="10" rx="1" stroke="none"/>
        <rect x="5" y="11" width="2" height="10" rx="1" transform="rotate(-90 5 11)" stroke="none"/>
        <rect x="15" y="21" width="2" height="10" rx="1" transform="rotate(-90 15 21)" stroke="none"/>
        <rect x="23.7988" y="4.48453" width="2" height="28" rx="1" transform="rotate(45 23.7988 4.48453)" stroke="none"/>
    </g>
);
const EmotionButton = (
    <g>
        <path d="M23.75 1H6.25C3.35051 1 1 3.35051 1 6.25V23.75C1 26.6495 3.35051 29 6.25 29H23.75C26.6495 29 29 26.6495 29 23.75V6.25C29 3.35051 26.6495 1 23.75 1Z" fill="#fff" strokeWidth="2"/>
        <circle cx="10" cy="16" r="1" stroke="none"/>
        <circle cx="20" cy="16" r="1" stroke="none"/>
        <path d="M10 16V16C10 18.7614 12.2386 21 15 21V21C17.7614 21 20 18.7614 20 16V16" fill="none" strokeWidth="2"/>
        <circle cx="11" cy="12" r="2" stroke="none"/>
        <circle cx="19" cy="12" r="2" stroke="none"/>
        <circle cx="15" cy="15" r="10" fill="none" strokeWidth="2"/>
    </g>
);

const PinButton = (
    <g>
        <rect x="2" y="5.64844" width="5.15936" height="6" transform="rotate(-45 2 5.64844)" fill="white" stroke="none"/>
        <rect x="5" y="9.74902" width="6.71605" height="3.4919" transform="rotate(-45 5 9.74902)" fill="white" stroke="none"/>
        <path d="M1.60091 6.90586C1.23468 7.27209 0.640903 7.27209 0.274673 6.90586C-0.0915575 6.53962 -0.0915575 5.94585 0.274673 5.57962L5.57962 0.274672C5.94585 -0.0915577 6.53962 -0.0915573 6.90585 0.274673C7.27208 0.640903 7.27208 1.23468 6.90585 1.60091L1.60091 6.90586Z"/>
        <path d="M1.79985 6.70692C1.43361 6.34069 1.43361 5.74691 1.79984 5.38068C2.16607 5.01445 2.75985 5.01445 3.12608 5.38068L5.77855 8.03316C6.14478 8.39939 6.14478 8.99316 5.77855 9.35939C5.41232 9.72562 4.81855 9.72562 4.45232 9.35939L1.79985 6.70692Z"/>
        <path d="M5.31437 3.19239C4.94814 2.82616 4.94814 2.23239 5.31437 1.86616C5.6806 1.49993 6.27438 1.49993 6.64061 1.86616L9.29308 4.51863C9.65931 4.88486 9.65931 5.47864 9.29308 5.84487C8.92685 6.2111 8.33307 6.2111 7.96684 5.84487L5.31437 3.19239Z"/>
        <path d="M4.36348 9.13793C4.22943 8.63765 4.52632 8.12342 5.0266 7.98937C5.52687 7.85532 6.0411 8.15221 6.17515 8.65249L7.00039 11.7323C7.13444 12.2326 6.83755 12.7468 6.33727 12.8809C5.83699 13.0149 5.32277 12.7181 5.18872 12.2178L4.36348 9.13793Z"/>
        <path d="M5.51331 12.9402C5.14708 12.574 5.14708 11.9802 5.51331 11.614C5.87954 11.2478 6.47331 11.2478 6.83954 11.614L7.76791 12.5424C8.13414 12.9086 8.13414 13.5024 7.76791 13.8686C7.40168 14.2348 6.8079 14.2348 6.44167 13.8686L5.51331 12.9402Z"/>
        <path d="M7.76791 13.8686C7.40168 14.2348 6.8079 14.2348 6.44167 13.8686C6.07544 13.5024 6.07544 12.9086 6.44167 12.5424L12.4761 6.50798C12.8423 6.14175 13.4361 6.14175 13.8023 6.50798C14.1685 6.87421 14.1685 7.46799 13.8023 7.83422L7.76791 13.8686Z" />
        <path d="M9.69095 11.0172C9.32472 10.651 9.32472 10.0572 9.69095 9.69095C10.0572 9.32472 10.651 9.32472 11.0172 9.69095L15.7253 14.3991C16.0916 14.7653 16.0916 15.3591 15.7253 15.7253C15.3591 16.0916 14.7653 16.0916 14.3991 15.7253L9.69095 11.0172Z" />
        <path d="M11.5477 6.90586C11.1815 6.53963 11.1815 5.94585 11.5477 5.57962C11.9139 5.21339 12.5077 5.21339 12.8739 5.57962L13.8023 6.50798C14.1685 6.87421 14.1685 7.46799 13.8023 7.83422C13.4361 8.20045 12.8423 8.20045 12.476 7.83422L11.5477 6.90586Z" />
        <path d="M9.09286 4.40855C8.59258 4.2745 8.07835 4.57138 7.9443 5.07166C7.81025 5.57194 8.10714 6.08617 8.60742 6.22022L11.6873 7.04546C12.1875 7.17951 12.7018 6.88262 12.8358 6.38234C12.9699 5.88206 12.673 5.36784 12.1727 5.23379L9.09286 4.40855Z" />
    </g>
);

const SettingButton = (
    <g className="sidebutton">
        <circle cx="12.5" cy="12.5" r="12.5" fill="#00000000" stroke="none" className="sidebutton"/>
        <rect className="sidebutton" x="2.80762" y="5.63672" width="4" height="5" rx="1" transform="rotate(-45 2.80762 5.63672)" stroke="none"/>
        <rect className="sidebutton" x="18.364" y="2.80762" width="4" height="5" rx="1" transform="rotate(45 18.364 2.80762)" stroke="none"/>
        <rect className="sidebutton" x="10" y="1" width="4" height="5" rx="1" stroke="none"/>
        <rect className="sidebutton" x="10" y="18" width="4" height="5" rx="1" stroke="none"/>
        <rect className="sidebutton" x="18" y="14.0005" width="4" height="5" rx="1" transform="rotate(-90 18 14.0005)" stroke="none"/>
        <rect className="sidebutton" x="1" y="14.0005" width="4" height="5" rx="1" transform="rotate(-90 1 14.0005)" stroke="none"/>
        <rect className="sidebutton" x="6.34302" y="14.8286" width="4" height="5" rx="1" transform="rotate(45 6.34302 14.8286)" stroke="none"/>
        <rect className="sidebutton" x="21.1924" y="18.3643" width="4" height="5" rx="1" transform="rotate(135 21.1924 18.3643)" stroke="none"/>
        <circle className="sidebutton"cx="12" cy="12" r="6" transform="rotate(-45 12 12)" fill="none" strokeWidth="4"/>
    </g>
)

const HistoryButton = (
    <g className="sidebutton">
        <circle cx="12.5" cy="12.5" r="12.5" fill="#00000000" stroke="none" className="sidebutton"/>
        <path className="sidebutton" d="M4.59142 12.1043C4.59142 10.1923 5.25438 8.33945 6.46734 6.86146C7.6803 5.38346 9.36821 4.37177 11.2435 3.99875C13.1187 3.62574 15.0653 3.91449 16.7516 4.8158C18.4378 5.71711 19.7593 7.17522 20.491 8.94168C21.2227 10.7081 21.3193 12.6736 20.7643 14.5033C20.2092 16.333 19.037 17.9136 17.4472 18.9759C15.8574 20.0381 13.9485 20.5163 12.0457 20.3289C10.1429 20.1414 8.36398 19.3001 7.01199 17.9481" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="2.12132" y1="11.186" x2="4.54516" y2="13.6099" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="2.12132" y1="11.186" x2="4.54516" y2="13.6099" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="2.12132" y1="11.186" x2="4.54516" y2="13.6099" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="4.59106" y1="13.6565" x2="7.0149" y2="11.2327" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="4.59106" y1="13.6565" x2="7.0149" y2="11.2327" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="4.59106" y1="13.6565" x2="7.0149" y2="11.2327" fill="none" strokeWidth="3" strokeLinecap="round"/>
        <line className="sidebutton" x1="12.9375" y1="7.59473" x2="12.9375" y2="12.0226" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <line className="sidebutton" x1="15.9" y1="15.6445" x2="12.8556" y2="12.6001" fill="none" strokeWidth="2" strokeLinecap="round"/>
    </g>
)


const ClearButton = (
    <g>
        <path d="M4 1H20C21.6569 1 23 2.34315 23 4V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1Z" fill="white" strokeWidth="2"/>
        <rect x="14.3137" y="4" width="10" height="10" rx="2" transform="rotate(45 14.3137 4)" stroke="none"/>
        <path d="M10.071 9.65689L15.7279 15.3137L12.4853 18.5564L10.071 18.5564L7.65683 18.5564L4.41419 15.3137L10.071 9.65689Z" fill="white" strokeWidth="2"/>
    </g>
)


export {
    ListSmall,
    SpaceSmall,
    PeekSmall,
    ListBig,
    SpaceBig,
    PeekBig,
    Collapse,
    SpaceButton,
    ListButton,
    PinButton,
    NewListButton,
    NewSpaceButton,
    SentimentButton,
    EmotionButton,
    SettingButton,
    HistoryButton,
    ClearButton
}