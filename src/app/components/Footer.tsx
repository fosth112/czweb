import Link from "next/link"

function Footer() {
    return (
        <footer className="flex justify-center px-3 py-[20px] border-t">
            <div className="w-full max-w-screen-lg">

                <div className="flex justify-center">
                    <Link href={'/'} className="font-bold ou">
                        PROLEAK
                    </Link>
                </div>
                <p className="text-xs text-center text-zinc-500">© 2024 PROLEAK INNOVATION</p>

            </div>
        </footer>
    )
}

export default Footer