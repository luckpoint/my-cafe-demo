import type { FC } from 'hono/jsx'
import { html } from 'hono/html'

export const Layout: FC<{ title?: string; children?: any }> = (props) => {
    const title = props.title ? `${props.title} - My Cafe Demo` : 'My Cafe Demo'
    return (
        <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
                <link href="/css/styles.css" rel="stylesheet" />
                <script src="https://cdn.tailwindcss.com"></script>
                {html`
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#00704A',
                            secondary: '#D4E9E2',
                            accent: '#1E3932',
                        }
                    }
                }
            }
        </script>
        `}
            </head>
            <body class="bg-gray-50 min-h-screen flex flex-col font-sans text-gray-900">
                {props.children}
            </body>
        </html>
    )
}
