import { Link } from "react-router-dom";
import H1Title from "../../ui/H1Title";

export default function Errors() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <H1Title>Erreur 404</H1Title>
      <Link
        to={`/`}
        className={`
                                    text-sm bg-green-medium py-2 px-6 rounded-full cursor-pointer uppercase font-bold w-auto mx-auto border-2 border-green-medium
                                    hover:bg-white hover:text-green-light hover:border-green-light
                                    md:text-base
                                `}>
        Revenir à l'accueil
      </Link>
    </div>
  );
}
