import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="60" cy="60" r="58" fill="#000000" stroke="#FF0000" strokeWidth="2"/>
            
            {/* Main "K" letter design */}
            <g fill="#FFFFFF">
                {/* Left vertical line of K */}
                <rect x="25" y="25" width="8" height="70" />
                
                {/* Upper diagonal of K */}
                <polygon points="33,25 50,25 95,55 87,65 40,40 33,40" />
                
                {/* Lower diagonal of K */}
                <polygon points="33,80 40,80 87,55 95,65 50,95 33,95" />
            </g>
            
            {/* Kitchen utensils accent - Fork and Knife crossed */}
            <g stroke="#FF0000" strokeWidth="2" fill="none">
                {/* Fork */}
                <path d="M75 25 L85 35 M77 23 L87 33 M79 21 L89 31" strokeWidth="1.5"/>
                <line x1="83" y1="27" x2="90" y2="34" strokeWidth="2"/>
                
                {/* Knife */}
                <line x1="85" y1="25" x2="95" y2="35" strokeWidth="2"/>
                <line x1="87" y1="23" x2="89" y2="25" strokeWidth="3"/>
            </g>
            
            {/* Small decorative elements */}
            <g fill="#FF0000">
                <circle cx="70" cy="85" r="3"/>
                <circle cx="80" cy="90" r="2"/>
                <circle cx="85" cy="80" r="2.5"/>
            </g>
            
            {/* Text "KASH" below (small) */}
            <text x="60" y="110" textAnchor="middle" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000000">
                KASH
            </text>
        </svg>
    );
}