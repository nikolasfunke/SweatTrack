import logoIcon from "../assets/logo.svg";
import logoFull from "../assets/logo_sweatTrack.svg";

function Header() {
    return (
        <>
                {/* CABEÇALHO */}
                <header className="flex justify-between items-center p-6 bg-white shadow-sm">
                    
                    <div className="flex items-center gap-2">
                        
                        {/* Ícone de Cruz + Texto São Camilo */}
                        <div className="text-[#DA0027] font-black text-lg flex items-center gap-1 tracking-tighter">
                            <img src={logoFull} width={150} height={150} />
                        </div>

                    </div>

                    {/* Avatar Genérico */}
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white shadow-md overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                        />
                    </div>

                </header>
        </>
    )
}

export default Header