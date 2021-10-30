import { Step, StepLabel, Stepper } from "@mui/material";

const CheckoutWizard: React.FC<{ activeStep: number }> = ({ activeStep = 0 }) => {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {["Login", "Shipping Address", "Payment Method", "Place Order"].map((step) => (
        <Step key={step}>
          <StepLabel>{step}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default CheckoutWizard;
