import type { ReactNode } from "react";
import { Link } from "react-router";

/** The bar that tops every screen: wordmark left, machine readout right. */
const Navbar = ({ meta, children }: { meta?: ReactNode; children?: ReactNode }) => {
    return (
        <header className="screen-bar">
            <div className="flex items-center gap-6">
                <Link to="/" className="wordmark">
                    RESUME LENS
                </Link>
                {meta}
            </div>
            <nav className="flex items-center gap-5 md:gap-6">{children}</nav>
        </header>
    );
};

export default Navbar;
