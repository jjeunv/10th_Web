type Props = { message: string };

const ErrorMessage = ({ message }: Props) => (
  <div className="text-center py-20 text-sm text-red-400">{message}</div>
);

export default ErrorMessage;
