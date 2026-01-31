import { CustomButton } from '@components/atoms/defaultElements';
import { MenuArrowBack } from '@components/atoms/iconComponents';
import { useNavigatePage } from '@hooks/custom';

function BackNavigateButton() {
  const { navigateBack,previousPage } = useNavigatePage();
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateBack();
  };
  return (
    <CustomButton 
    className="flex gap-2"
    onClick={handleClick}>
      <div>{previousPage}</div><MenuArrowBack />
    </CustomButton>
  );
}

export default BackNavigateButton;
