const Loader = () => {
  return (
    <div className="h-full w-full">
      <div className="flex space-x-2 justify-center items-center h-full bg-white w-full dark:invert">
        <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default Loader;
