
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <p className="text-muted-foreground mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go to home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
