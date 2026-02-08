import Link from "next/link"

function Footer() {
    return (
        <footer className="flex justify-center px-3 py-[20px] border-t border-white/10">
            <div className="w-full max-w-screen-lg">

                <div className="flex justify-center">
                    <Link href={'/'} className="font-bold ou text-white">
                        PROLEAK
                    </Link>
                </div>
                <p className="text-xs text-center text-slate-400">© 2024 PROLEAK INNOVATION</p>

            </div>
        </footer>
    )
}

export default Footer
