import ModeSwitcherUi from "@/components/ui/mode-switcher.ui";

const UiStyling = () => {
  return (
    <div className="settings-page-container">
      {/* Page Header */}
      <div className="page-header-container">
        <h2 className="page-title">UI-Einstellungen</h2>
        <p className="subheader">
          Verwalten Sie Ihr Design. Farben, System, etc.
        </p>
      </div>

      {/* UI Theme Section */}
      <div className="section-container">
        {/* Left Label Column */}
        <div className="w-full md:w-64">
          <h3 className="section-header">UI-Design</h3>
          <p className="section-description">
            So wird die Website aussehen!
          </p>
        </div>

        {/* Right Content */}
        <div className="flex flex-col gap-6 w-full max-w-xl scale-75 sm:scale-100">
          <ModeSwitcherUi></ModeSwitcherUi>
        </div>
      </div>
    </div>
  );
};

export default UiStyling;
