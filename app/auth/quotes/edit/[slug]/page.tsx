import EditForm from "@/components/forms/edit-form";

export default function EditQuote() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-3xl text-center font-semibold mb-20">
            Edycja cytatu
          </h2>
          <EditForm />
        </div>
      </div>
    </>
  );
}
