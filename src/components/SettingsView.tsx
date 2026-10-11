import React, { useState, useEffect } from 'react';
import { ALL_LANGUAGES, LanguageOption } from '../data/languages';
import { LinkedBankAccount } from '../types/payment';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import {
  Globe2,
  Search,
  Check,
  Languages,
  Sliders,
  Bell,
  Shield,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Volume2,
  Lock,
  User,
  KeyRound,
  MessageSquare,
  ShieldAlert,
  Info,
  AlertOctagon,
  Trash2,
  X,
  CheckCircle2,
  Fingerprint,
  Phone,
  Mail,
  Building,
  SmartphoneNfc,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Banknote,
  Plus,
  Landmark,
  Scale,
  CreditCard,
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  LogIn,
  UserPlus,
  ScanFace,
  Camera,
  ShieldQuestion,
  Loader2,
  Smile,
  Activity,
} from 'lucide-react';

interface Props {
  currentLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  hapticEnabled?: boolean;
  onToggleHaptic?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  transactionPin?: string;
  onChangeTransactionPin?: (pin: string) => void;
  pinRequiredThreshold?: number;
  onChangePinRequiredThreshold?: (threshold: number) => void;
  linkedBanks?: LinkedBankAccount[];
  onActivateBank?: (bankId: string) => void;
  onLinkNewBank?: (bank: Partial<LinkedBankAccount>) => void;
  hasAcceptedTerms?: boolean;
  onAcceptTerms?: () => void;
  appPasscode?: string;
  onUpdateAppPasscode?: (newPasscode: string) => void;
}

export const SettingsView: React.FC<Props> = ({
  currentLanguage,
  onSelectLanguage,
  hapticEnabled = true,
  onToggleHaptic,
  soundEnabled = true,
  onToggleSound,
  transactionPin = '',
  onChangeTransactionPin,
  pinRequiredThreshold = 0,
  onChangePinRequiredThreshold,
  linkedBanks = [],
  onActivateBank,
  onLinkNewBank,
  hasAcceptedTerms = true,
  onAcceptTerms,
  appPasscode: appPasscodeProp = '',
  onUpdateAppPasscode,
}) => {
  // Main settings active sub-section tab ('menu' for main horizontal page, or specific page string)
  const [activeSettingsSection, setActiveSettingsSection] = useState<
    'menu' | 'language' | 'profile' | 'linked_banks' | 'login' | 'sms' | 'security' | 'terms' | 'about' | 'switch_account' | 'close_account'
  >('menu');

  // Terms and conditions modal state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [bankActivationSuccessMsg, setBankActivationSuccessMsg] = useState<string | null>(null);

  // *Language state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nigerian' | 'african' | 'global'>('all');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // *Profile state
  const [fullName, setFullName] = useState<string>('Col. Osagiede Joshua');
  const [emailAddress, setEmailAddress] = useState<string>('osagiedejoshua024@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState<string>('+234 810 911 8552');
  const [bvnNumber] = useState<string>('22194829104');
  const [ninNumber] = useState<string>('84910294819');
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  // Link Primary Bank state
  const [selectedPrimaryBank, setSelectedPrimaryBank] = useState<string>('Zenith Bank PLC');
  const [primaryAccountNumber, setPrimaryAccountNumber] = useState<string>('0129484092');
  const [primaryAccountName, setPrimaryAccountName] = useState<string>('OSAGIEDE JOSHUA');
  const [isLinkingNewBank, setIsLinkingNewBank] = useState<boolean>(false);
  const [bankLinkSuccess, setBankLinkSuccess] = useState<boolean>(false);

  // *Login settings state
  const [biometricsLoginEnabled, setBiometricsLoginEnabled] = useState<boolean>(true);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState<boolean>(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState<string>('2m');
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);
  const [localPin, setLocalPin] = useState<string>(transactionPin);
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);
  // 6-Digit App Entry Password (Defaults cleared; bound to dynamic login code)
  const [appPasscode, setAppPasscode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('kudipulse_app_passcode');
      if (stored === '200007' || stored === '709240' || stored === '000000' || stored === '2468') {
        localStorage.removeItem('kudipulse_app_passcode');
        return '';
      }
      return appPasscodeProp || stored || '';
    } catch {
      return appPasscodeProp || '';
    }
  });

  useEffect(() => {
    if (appPasscodeProp) {
      setAppPasscode(appPasscodeProp);
      setTempPasscode(appPasscodeProp);
    }
  }, [appPasscodeProp]);

  const [isEditingPasscode, setIsEditingPasscode] = useState<boolean>(false);
  const [tempPasscode, setTempPasscode] = useState<string>(appPasscode);
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState<string | null>(null);

  // *SMS alerts state
  const [smsDebitAlerts, setSmsDebitAlerts] = useState<boolean>(true);
  const [smsCreditAlerts, setSmsCreditAlerts] = useState<boolean>(true);
  const [smsOtpAlerts, setSmsOtpAlerts] = useState<boolean>(true);
  const [smsAlertSaved, setSmsAlertSaved] = useState<boolean>(false);

  // *Security centre state
  const [remoteWipeAuthorized, setRemoteWipeAuthorized] = useState<boolean>(false);
  const [tamperDetectionSensors, setTamperDetectionSensors] = useState<boolean>(true);

  // *Switch Account State (Sign In & Login Options)
  const [switchAction, setSwitchAction] = useState<'options' | 'sign_in' | 'login'>('options');
  const [switchEmailOrPhone, setSwitchEmailOrPhone] = useState<string>('');
  const [switchPassword, setSwitchPassword] = useState<string>('');
  const [switchSignInIdType, setSwitchSignInIdType] = useState<'nin' | 'bvn'>('nin'); // In Sign In: Choice of NIN or BVN (Tier 2+, 18+ yrs)
  const [switchNin, setSwitchNin] = useState<string>('84910294819');
  const [switchBvn, setSwitchBvn] = useState<string>('22349018247');
  const [switchNinError, setSwitchNinError] = useState<string | null>(null);
  const [switchRememberDevice, setSwitchRememberDevice] = useState<boolean>(true);
  const [switchStatusMessage, setSwitchStatusMessage] = useState<string | null>(null);
  const [isSwitchingLoading, setIsSwitchingLoading] = useState<boolean>(false);

  // Account Behavior / Risk Sentinel: Flags suspicious activities like multiple failed PIN attempts, unfamiliar device, rapid geolocation jump
  const [accountRiskStatus, setAccountRiskStatus] = useState<'normal' | 'suspicious_terminal' | 'unusual_transfer' | 'failed_auth_strikes'>('suspicious_terminal');
  const [isFaceVerificationModalOpen, setIsFaceVerificationModalOpen] = useState<boolean>(false);
  const [faceScanProgress, setFaceScanProgress] = useState<number>(0);
  const [isFaceScanning, setIsFaceScanning] = useState<boolean>(false);
  const [faceScanCompleted, setFaceScanCompleted] = useState<boolean>(false);

  // 5 Interactive Liveness Challenge Steps:
  // 1. Nod your head
  // 2. Blink your eyes
  // 3. Open your mouth
  // 4. Smile
  // 5. Turn head Left or Right
  type LivenessChallenge = 'nod' | 'blink' | 'mouth' | 'smile' | 'turn';
  const [currentLivenessStep, setCurrentLivenessStep] = useState<number>(0);
  const [completedLivenessSteps, setCompletedLivenessSteps] = useState<Record<string, boolean>>({
    nod: false,
    blink: false,
    mouth: false,
    smile: false,
    turn: false,
  });
  const [turnDirection, setTurnDirection] = useState<'left' | 'right'>('left');
  const [livenessActionFeedback, setLivenessActionFeedback] = useState<string>('Align face in reticle');

  const [faceScanResult, setFaceScanResult] = useState<{
    ninMatched: boolean;
    confidenceScore: number;
    ninSubjectName: string;
    biometricToken: string;
  } | null>(null);
  const [pendingAuthPayload, setPendingAuthPayload] = useState<{
    type: 'sign_in' | 'login';
    name: string;
    identifier: string;
    nin: string;
  } | null>(null);

  // Available saved profiles for fast switching
  const [savedProfiles] = useState([
    {
      id: 'profile-primary',
      name: 'Col. Osagiede Joshua',
      identifier: 'osagiedejoshua024@gmail.com',
      role: 'Primary Account (Commander)',
      bank: 'Zenith Bank PLC',
      badge: 'Active',
      initials: 'OJ',
    },
    {
      id: 'profile-merchant',
      name: 'Joshua Osagiede (Corporate Merch)',
      identifier: '+234 810 911 8552',
      role: 'Business / Merchant Terminal',
      bank: 'Access Bank PLC',
      badge: 'Switch Ready',
      initials: 'JO',
    },
    {
      id: 'profile-tactical',
      name: 'Field Ops Sentinel',
      identifier: 'ops-tactical@kudipulse.ng',
      role: 'Secondary Recon Wallet',
      bank: 'GTBank (Guaranty Trust)',
      badge: 'Switch Ready',
      initials: 'FO',
    },
  ]);

  // *|Close account| state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [closeReason, setCloseReason] = useState<string>('Switching to another device');
  const [confirmDeleteText, setConfirmDeleteText] = useState<string>('');
  const [accountTerminated, setAccountTerminated] = useState<boolean>(false);

  const filteredLanguages = ALL_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'nigerian') {
      return lang.region.includes('Nigeria');
    }
    if (selectedFilter === 'african') {
      return (
        lang.region.includes('Africa') ||
        lang.region.includes('Nigeria') ||
        lang.region.includes('Ghana') ||
        lang.region.includes('Kenya') ||
        lang.region.includes('Ethiopia') ||
        lang.region.includes('Rwanda')
      );
    }
    if (selectedFilter === 'global') {
      return (
        lang.region.includes('Global') ||
        lang.region.includes('Europe') ||
        lang.region.includes('Asia') ||
        lang.region.includes('Americas') ||
        lang.region.includes('Worldwide') ||
        lang.region.includes('Middle East')
      );
    }
    return true;
  });

  const handleChooseLanguage = (lang: LanguageOption) => {
    onSelectLanguage(lang);
    setSaveSuccessMessage(`Language set to ${lang.name} (${lang.nativeName})`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveLoginSettings = () => {
    setSessionSaved(true);
    setTimeout(() => setSessionSaved(false), 2500);
  };

  const handleSaveSmsAlerts = () => {
    setSmsAlertSaved(true);
    setTimeout(() => setSmsAlertSaved(false), 2500);
  };

  const handleConfirmCloseAccount = () => {
    if (confirmDeleteText.trim().toUpperCase() === 'CLOSE') {
      setAccountTerminated(true);
      setIsCloseModalOpen(false);
    }
  };

  // 5 Liveness Challenges Sequence:
  // 1. Nod your head
  // 2. Blink your eyes
  // 3. Open your mouth
  // 4. Smile
  // 5. Turn head left or right
  const livenessStepsList: { id: LivenessChallenge; title: string; instruction: string; icon: string }[] = [
    { id: 'nod', title: 'Nod Your Head', instruction: 'Gently nod your head up and down to verify 3D depth', icon: '↕️' },
    { id: 'blink', title: 'Blink Your Eyes', instruction: 'Blink eyes naturally 2 times to detect real pupil reflex', icon: '👁️' },
    { id: 'mouth', title: 'Open Your Mouth', instruction: 'Open mouth slightly to verify facial muscle geometry', icon: '👄' },
    { id: 'smile', title: 'Smile at the Camera', instruction: 'Smile openly to check facial landmark dynamics', icon: '😊' },
    { id: 'turn', title: 'Turn Head Left or Right', instruction: 'Turn your face gently to the left or right', icon: '↔️' },
  ];

  // Starts the Liveness sequence or simulates automatic progression through the 5 biometric gestures
  const triggerFaceVerificationScan = () => {
    setIsFaceScanning(true);
    setCurrentLivenessStep(0);
    setFaceScanProgress(10);
    setCompletedLivenessSteps({
      nod: false,
      blink: false,
      mouth: false,
      smile: false,
      turn: false,
    });
    setLivenessActionFeedback('Step 1/5: Please nod your head...');

    // Automatically progresses through the 5 gestures with realistic biometric verification pauses
    let stepIndex = 0;
    const stepKeys: LivenessChallenge[] = ['nod', 'blink', 'mouth', 'smile', 'turn'];
    const feedbackList = [
      'Step 1/5: Detecting nod depth... Hold steady',
      'Step 2/5: Detecting eye blink & pupil reflex...',
      'Step 3/5: Mouth opening verified... Analyzing jawline',
      'Step 4/5: Smile detected... Calculating facial symmetry',
      'Step 5/5: Turn angle verified... Validating with NIMC NIN database',
    ];

    const timer = setInterval(() => {
      if (stepIndex < stepKeys.length) {
        const currentKey = stepKeys[stepIndex];
        setCompletedLivenessSteps((prev) => ({ ...prev, [currentKey]: true }));
        setFaceScanProgress(Math.min(95, (stepIndex + 1) * 19));
        stepIndex++;
        setCurrentLivenessStep(stepIndex);

        if (stepIndex < stepKeys.length) {
          setLivenessActionFeedback(feedbackList[stepIndex]);
        }
      } else {
        clearInterval(timer);
        setIsFaceScanning(false);
        setFaceScanCompleted(true);
        setFaceScanProgress(100);
        setLivenessActionFeedback('All 5 Liveness Tests Passed! Face matches NIN 84910294819.');
        setFaceScanResult({
          ninMatched: true,
          confidenceScore: 99.4,
          ninSubjectName: fullName,
          biometricToken: `NIMC-BIO-LIVENESS-VERIFIED-${Date.now()}`,
        });
      }
    }, 1200);
  };

  // Manual gesture trigger button for interactive operator testing
  const handlePerformManualGesture = (stepKey: LivenessChallenge) => {
    setCompletedLivenessSteps((prev) => ({ ...prev, [stepKey]: true }));
    const allCompletedSoFar = { ...completedLivenessSteps, [stepKey]: true };
    const completedCount = Object.values(allCompletedSoFar).filter(Boolean).length;
    setFaceScanProgress(Math.min(100, completedCount * 20));

    if (completedCount === 5) {
      setIsFaceScanning(false);
      setFaceScanCompleted(true);
      setLivenessActionFeedback('All 5 Liveness Tests Passed! Face matches NIN 84910294819.');
      setFaceScanResult({
        ninMatched: true,
        confidenceScore: 99.4,
        ninSubjectName: fullName,
        biometricToken: `NIMC-BIO-LIVENESS-VERIFIED-${Date.now()}`,
      });
    }
  };

  const handleFinishFaceVerification = () => {
    if (pendingAuthPayload) {
      if (pendingAuthPayload.name) {
        setFullName(pendingAuthPayload.name);
      }
      if (pendingAuthPayload.identifier.includes('@')) {
        setEmailAddress(pendingAuthPayload.identifier);
      } else if (pendingAuthPayload.identifier) {
        setPhoneNumber(pendingAuthPayload.identifier);
      }
      setSwitchStatusMessage(
        `NIN & 5-Step Liveness Match Verified (99.4%)! Switched to ${pendingAuthPayload.name || fullName}`
      );
    }
    setIsFaceVerificationModalOpen(false);
    setFaceScanCompleted(false);
    setFaceScanProgress(0);
    setFaceScanResult(null);
    setPendingAuthPayload(null);
    setCompletedLivenessSteps({
      nod: false,
      blink: false,
      mouth: false,
      smile: false,
      turn: false,
    });
    setSwitchAction('options');
    setTimeout(() => setSwitchStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Breadcrumb Header: Switch between Full Horizontal Menu and Dedicated Page */}
      {activeSettingsSection !== 'menu' ? (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-3xl p-3 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveSettingsSection('menu')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Settings Menu</span>
          </button>

          {/* Quick Horizontal Carousel on subpages for fast switching */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin max-w-xl">
            <button
              onClick={() => setActiveSettingsSection('language')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'language'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Language
            </button>
            <button
              onClick={() => setActiveSettingsSection('profile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'profile'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveSettingsSection('linked_banks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'linked_banks'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Linked Banks
            </button>
            <button
              onClick={() => setActiveSettingsSection('login')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'login'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Login Settings
            </button>
            <button
              onClick={() => setActiveSettingsSection('sms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'sms'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              SMS Alerts
            </button>
            <button
              onClick={() => setActiveSettingsSection('security')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'security'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Security Centre
            </button>
            <button
              onClick={() => setActiveSettingsSection('terms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'terms'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => {
                setActiveSettingsSection('switch_account');
                setSwitchAction('options');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'switch_account'
                  ? 'bg-cyan-600 text-white'
                  : 'text-cyan-400 hover:text-white bg-cyan-950/40'
              }`}
            >
              Switch Account
            </button>
            <button
              onClick={() => setActiveSettingsSection('close_account')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSettingsSection === 'close_account'
                  ? 'bg-red-600 text-white'
                  : 'text-red-400 hover:text-red-200 bg-red-950/30'
              }`}
            >
              Close Account
            </button>
          </div>
        </div>
      ) : (
        /* HORIZONTAL FORM VIEW OF ALL 9 SETTINGS MODULES */
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span>Tactical App Configuration Hub</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tap any category card below to navigate to its dedicated page of settings, controls, and compliance tools.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>9 Modules Active</span>
            </div>
          </div>

          {/* 9 HORIZONTAL TILES IN RESPONSIVE GRID / HORIZONTAL FLOW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Language */}
            <div
              onClick={() => setActiveSettingsSection('language')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    *Language
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentLanguage.name} ({currentLanguage.flag} {currentLanguage.code.toUpperCase()})
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 2. Profile */}
            <div
              onClick={() => setActiveSettingsSection('profile')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    *Profile
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                    {fullName}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 3. Linked Banks */}
            <div
              onClick={() => setActiveSettingsSection('linked_banks')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    *Linked banks
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {linkedBanks.length} CBN-cleared institutions
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 4. Login Settings */}
            <div
              onClick={() => setActiveSettingsSection('login')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    *Login settings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Passcode • PIN • Biometrics
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 5. SMS Alerts */}
            <div
              onClick={() => setActiveSettingsSection('sms')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    *SMS alerts
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Debit & Credit Push Dispatch
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 6. Security Centre */}
            <div
              onClick={() => setActiveSettingsSection('security')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-teal-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-teal-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                    *Security centre
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hardware Enclave & Remote Wipe
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 7. Terms and Conditions */}
            <div
              onClick={() => setActiveSettingsSection('terms')}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    *Terms and conditions
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    CBN Framework & Privacy Policy
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 8. Switch Account */}
            <div
              onClick={() => {
                setActiveSettingsSection('switch_account');
                setSwitchAction('options');
              }}
              className="group p-4 bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    *Switch account
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sign In • Log In • NIN & Face Verification
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 9. Closed Account */}
            <div
              onClick={() => setActiveSettingsSection('close_account')}
              className="group p-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 hover:border-red-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-red-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-300 group-hover:text-red-200 transition-colors">
                    *Closed account
                  </h3>
                  <p className="text-[11px] text-red-300/80 mt-0.5">
                    Revoke hardware keys & terminate
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* Account Terminated Simulation Alert */}
      {accountTerminated && (
        <div className="p-4 bg-red-950/90 border border-red-600 rounded-2xl text-red-200 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                Account Closure Initiated
              </h4>
              <p className="text-[11px] text-red-200 mt-0.5">
                All tokenized hardware keys in Wear OS KeyStore and Apple Secure Enclave have been revoked. NIBSS mandate unlinked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAccountTerminated(false)}
            className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
          >
            Re-provision
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. *LANGUAGE SECTION WITH SEARCH ICON                        */}
      {/* ============================================================ */}
      {activeSettingsSection === 'language' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Header banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <span>*Language</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Active: {currentLanguage.flag} {currentLanguage.name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select locale for smartwatch display, companion audio prompts, and printable receipts.
                  </p>
                </div>
              </div>

              {saveSuccessMessage && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Language Search Bar with Search Icon */}
            <div className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  {/* Search Icon */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search all languages (e.g. English, Yoruba, Hausa, Igbo, Pidgin, Swahili)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Region Filters */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      selectedFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedFilter('nigerian')}
                    className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                      selectedFilter === 'nigerian'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬 Nigeria</span>
                  </button>
                  <button
                    onClick={() => setSelectedFilter('african')}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      selectedFilter === 'african'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Africa
                  </button>
                  <button
                    onClick={() => setSelectedFilter('global')}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      selectedFilter === 'global'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Global
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono px-1">
                <span>Showing {filteredLanguages.length} languages</span>
                <span>Selected: {currentLanguage.nativeName}</span>
              </div>

              {/* Languages Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {filteredLanguages.length === 0 ? (
                  <div className="col-span-full py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <Search className="w-6 h-6 text-slate-600 mx-auto" />
                    <p>No languages matched "{searchQuery}"</p>
                    <p className="text-[10px] text-slate-500">Try searching for "English", "Yoruba", "Hausa", "Igbo", or "Pidgin"</p>
                  </div>
                ) : (
                  filteredLanguages.map((lang) => {
                    const isSelected = currentLanguage.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleChooseLanguage(lang)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 group ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/40 text-white shadow-md'
                            : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                            {lang.flag}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{lang.name}</span>
                              {lang.isPopular && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-normal shrink-0">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span className="text-emerald-400/90">{lang.nativeName}</span>
                              <span>•</span>
                              <span className="truncate">{lang.region}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. *PROFILE SECTION                                          */}
      {/* ============================================================ */}
      {activeSettingsSection === 'profile' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*Profile</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    CBN Tier-3 Verified
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Account holder KYC credentials, identity verification, and primary wallet linkage.
                </p>
              </div>
            </div>

            {profileSaved && (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Profile updated</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number (SMS Alerts Target)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Column for "Link Primary Bank" */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-cyan-400" /> Link Primary Bank
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLinkingNewBank(!isLinkingNewBank)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                  >
                    {isLinkingNewBank ? 'Close' : 'Switch Bank'}
                  </button>
                </div>

                {!isLinkingNewBank ? (
                  <div className="px-3.5 py-2.5 bg-slate-950/80 border border-cyan-800/50 rounded-2xl text-xs text-slate-200 font-mono flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{selectedPrimaryBank}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            NIBSS Active
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Acct: •••• {primaryAccountNumber.slice(-4)} • {primaryAccountName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                      PRIMARY
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 border border-cyan-700/60 rounded-2xl space-y-2.5 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">Select Commercial Bank</label>
                      <select
                        value={selectedPrimaryBank}
                        onChange={(e) => setSelectedPrimaryBank(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="Zenith Bank PLC">Zenith Bank PLC (057)</option>
                        <option value="Access Bank PLC">Access Bank PLC (044)</option>
                        <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank) (058)</option>
                        <option value="First Bank of Nigeria">First Bank of Nigeria (011)</option>
                        <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA) (033)</option>
                        <option value="Stanbic IBTC Bank">Stanbic IBTC Bank (221)</option>
                        <option value="Kuda Bank">Kuda Microfinance Bank (090267)</option>
                        <option value="Opay (Paycom)">OPay Digital Services (999992)</option>
                        <option value="Moniepoint MFB">Moniepoint MFB (090405)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">10-Digit NUBAN Account Number</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={primaryAccountNumber}
                        onChange={(e) => setPrimaryAccountNumber(e.target.value)}
                        placeholder="Enter 10-digit NUBAN"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-emerald-400">
                        NIBSS Name Inquiry: {primaryAccountName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBankLinkSuccess(true);
                          setIsLinkingNewBank(false);
                          setTimeout(() => setBankLinkSuccess(false), 2800);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all"
                      >
                        Confirm Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {bankLinkSuccess && (
              <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary settlement bank updated to <strong>{selectedPrimaryBank}</strong> (NUBAN verified).</span>
              </div>
            )}

            {/* KYC Identity Badges */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                National Identity Registrations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400">BVN:</span>
                  <span className="text-emerald-400 font-bold">•••• •••• {bvnNumber.slice(-4)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400">NIN:</span>
                  <span className="text-emerald-400 font-bold">•••• •••• {ninNumber.slice(-4)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2B. *LINKED BANKS SECTION (SIX COMMERCIAL BANKS + BALANCES)  */}
      {/* ============================================================ */}
      {activeSettingsSection === 'linked_banks' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 flex-wrap">
                  <span>*Linked Banks ({linkedBanks.length} Accounts)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Primary Anchor: {linkedBanks.find((b) => b.isPrimary)?.bankName.split(' ')[0] || 'Zenith'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Linked to Primary Settlement Bank. <strong>Only ONE account can be activated for transactions at a time.</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>Terms & Conditions</span>
              </button>
            </div>
          </div>

          {/* Feedback banner when user switches active transaction bank */}
          {bankActivationSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in font-mono shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{bankActivationSuccessMsg}</span>
            </div>
          )}

          {/* Rule Reminder Pill */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Central Bank of Nigeria Rule:</strong> To mitigate multi-source exposure on wearable smart devices, only one funded bank account may be designated as the <span className="text-emerald-400 font-bold">ACTIVE TRANSACTION SOURCE</span>. Tap <strong>"Activate for Tap-to-Pay"</strong> on any card to switch immediately.
            </div>
          </div>

          {/* Six Linked Bank Accounts Grid with Account Balances by the Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {linkedBanks.map((bank) => {
              const isActive = bank.isActiveForTransaction;
              const isPrimary = bank.isPrimary;

              return (
                <div
                  key={bank.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border-emerald-500/80 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Bank Brand, Primary Tag & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bank.colorTheme} flex items-center justify-center text-white shadow-md font-bold text-xs`}>
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{bank.bankName}</span>
                          {isPrimary && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NUBAN: •••• {bank.accountNumber.slice(-4)} • {bank.accountName}
                        </div>
                      </div>
                    </div>

                    {/* Active State Pill */}
                    {isActive ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                        Standby
                      </span>
                    )}
                  </div>

                  {/* Account Balance Widget Put By The Side */}
                  <div className="my-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                        Account Balance (by the side):
                      </span>
                      <div className="text-base font-extrabold text-white font-mono tracking-tight mt-0.5 flex items-center gap-1.5">
                        <span className="text-emerald-400 text-lg">₦</span>
                        <span>
                          {bank.balance.toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 block">Bank Code: {bank.bankCode}</span>
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">{bank.tier}</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      NIBSS Settlement: <strong className="text-slate-300">Ready</strong>
                    </span>

                    {isActive ? (
                      <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for Watch Tap</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onActivateBank) {
                            onActivateBank(bank.id);
                            setBankActivationSuccessMsg(
                              `Activated ${bank.bankName} (••${bank.accountNumber.slice(-4)}) as single active transaction source!`
                            );
                            setTimeout(() => setBankActivationSuccessMsg(null), 3500);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold font-mono transition-all border border-slate-700 hover:border-emerald-500 shadow-sm"
                      >
                        Activate for Tap-to-Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Link to View Full Terms & Conditions */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span>Multi-bank linkage governed by Central Bank of Nigeria PSM/DIR/CON/CWO/08/022.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline font-bold"
            >
              Review Terms & Conditions &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2C. *TERMS & CONDITIONS DEDICATED TAB                        */}
      {/* ============================================================ */}
      {activeSettingsSection === 'terms' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*Terms & Conditions</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    CBN Guidelines Certified
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Regulatory framework for contactless wearable payments, multi-bank linkage, and 2FA.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Document Viewer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <Landmark className="w-4 h-4 text-emerald-400" />
                1. Six-Bank Linkage Policy
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Up to six licensed commercial banks (Zenith, GTBank, Access, UBA, First Bank, Kuda) are securely linked to your profile via verified NUBAN and BVN inquiry.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400">
                &bull; Rule: Only 1 account is active for tap transactions at a time.
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                2. Contactless Ceilings
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transactions &le; ₦5,000 proceed with 4-Digit Security PIN on the smartwatch. All transactions exceeding ₦5,000 mandate companion biometric validation (TrueDepth Face ID).
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-400">
                &bull; CBN Ref: PSM/DIR/CON/CWO/08/022
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <Lock className="w-4 h-4 text-indigo-400" />
                3. Zero PAN & Hardware Keystores
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                No plain cardholder PAN or CVV is stored on the smartwatch. Cryptographic keys remain isolated within Android KeyStore (StrongBox) or Apple Secure Enclave.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-indigo-300">
                &bull; AES-256-GCM + HMAC-SHA256 nonces (60s validity)
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <Scale className="w-4 h-4 text-amber-400" />
                4. Fraud Liability & Instant Revocation
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In the event of a compromised smartwatch, tokens are immediately revokable from the Security Centre or via Account Closure protocol without affecting underlying bank accounts.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-amber-300">
                &bull; Immediate hardware token invalidation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Interactive Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={onAcceptTerms}
        hasAccepted={hasAcceptedTerms}
      />

      {/* ============================================================ */}
      {/* 3. *LOGIN SETTINGS SECTION                                   */}
      {/* ============================================================ */}
      {activeSettingsSection === 'login' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*Login settings</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Authentication Gate
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Biometrics, session timeout rules, and 2-Factor companion pairing credentials.
                </p>
              </div>
            </div>

            {sessionSaved && (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span>Saved successfully</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Biometric Toggle */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Biometric Login (Face ID / Touch ID)</div>
                  <p className="text-[11px] text-slate-400">
                    Use iPhone TrueDepth or Android BiometricPrompt for instant app and watch authorization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBiometricsLoginEnabled(!biometricsLoginEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  biometricsLoginEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    biometricsLoginEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* 2FA Toggle */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</div>
                  <p className="text-[11px] text-slate-400">
                    Mandate OTP confirmation whenever logging in from an unrecognized phone or smartwatch.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorAuthEnabled(!twoFactorAuthEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  twoFactorAuthEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    twoFactorAuthEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Auto-Lock Timeout */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Companion Auto-Lock Timer</div>
                <p className="text-[11px] text-slate-400">
                  Lock payment session after period of inactivity.
                </p>
              </div>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="30s">30 Seconds</option>
                <option value="1m">1 Minute</option>
                <option value="2m">2 Minutes</option>
                <option value="5m">5 Minutes</option>
              </select>
            </div>

            {/* 6-Digit App Entry Password Section */}
            <div className="p-4 bg-slate-950 border border-emerald-900/50 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>6-Digit App Security Password</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        GATE ENFORCED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prompted immediately when the app launches before granting full dashboard and simulator access.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingPasscode(!isEditingPasscode)}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
                >
                  {isEditingPasscode ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {!isEditingPasscode ? (
                <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Passcode:</span>
                    <span className="text-emerald-300 tracking-widest text-sm font-bold">
                      {appPasscode ? '••••••' : 'Not configured yet'}
                    </span>
                    {appPasscode && (
                      <span className="text-[10px] text-slate-500">(Ending in {appPasscode.slice(-2)})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Active Code
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-700/60 space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      Enter New 6-Digit Password (Numbers Only):
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={tempPasscode}
                      onChange={(e) => setTempPasscode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit passcode"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      Syncs with App Lock & Smartwatch Screen
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (tempPasscode.length === 6) {
                          setAppPasscode(tempPasscode);
                          if (onUpdateAppPasscode) onUpdateAppPasscode(tempPasscode);
                          try {
                            localStorage.setItem('kudipulse_app_passcode', tempPasscode);
                          } catch {
                            // ignore
                          }
                          setIsEditingPasscode(false);
                          setPasscodeSuccessMsg('6-Digit entry password updated successfully!');
                          setTimeout(() => setPasscodeSuccessMsg(null), 3000);
                        }
                      }}
                      disabled={tempPasscode.length !== 6}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                    >
                      Save Password
                    </button>
                  </div>
                </div>
              )}

              {passcodeSuccessMsg && (
                <div className="p-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center gap-1.5 animate-in fade-in font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{passcodeSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* 4-Digit Transaction PIN Section */}
            <div className="p-4 bg-slate-950 border border-indigo-900/50 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>4-Digit Smartwatch Transaction PIN</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Required on smartwatch screen prior to cryptographic signing and BLE transmission.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingPin(!isEditingPin)}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
                >
                  {isEditingPin ? 'Cancel' : 'Change PIN'}
                </button>
              </div>

              {!isEditingPin ? (
                <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Configured PIN:</span>
                    <span className="text-indigo-300 tracking-widest text-sm font-bold">••••</span>
                    <span className="text-[10px] text-slate-500">(Ending in {transactionPin.slice(-2)})</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Rule: {pinRequiredThreshold === 0 ? 'Mandatory for all transactions' : `Required for > ₦${pinRequiredThreshold.toLocaleString()}`}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-700/60 space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      Enter New 4-Digit Security PIN:
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={localPin}
                      onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2468"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      PIN Verification Threshold:
                    </label>
                    <select
                      value={pinRequiredThreshold}
                      onChange={(e) => onChangePinRequiredThreshold && onChangePinRequiredThreshold(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={0}>Always Require PIN (Recommended - Every Transaction)</option>
                      <option value={5000}>CBN Contactless Limit (&gt; ₦5,000 only)</option>
                      <option value={15000}>High-Value Only (&gt; ₦15,000)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      Format: Strictly 4 digits (POS / ATM Standard)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (localPin.length === 4) {
                          onChangeTransactionPin && onChangeTransactionPin(localPin);
                          try {
                            localStorage.setItem('kudipulse_payment_password', localPin);
                          } catch {
                            // ignore
                          }
                          setIsEditingPin(false);
                          setPinChangeMsg('4-Digit payment PIN updated successfully!');
                          setTimeout(() => setPinChangeMsg(null), 3000);
                        }
                      }}
                      disabled={localPin.length !== 4}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold font-mono transition-all"
                    >
                      Save New PIN
                    </button>
                  </div>
                </div>
              )}

              {pinChangeMsg && (
                <div className="p-2 bg-indigo-950 border border-indigo-700 rounded-xl text-xs text-indigo-200 flex items-center gap-1.5 animate-in fade-in font-mono">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{pinChangeMsg}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveLoginSettings}
              className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Login Settings
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. *SMS ALERTS SECTION                                       */}
      {/* ============================================================ */}
      {activeSettingsSection === 'sms' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*SMS alerts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    MTN • Airtel • Glo • 9mobile
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Instant GSM carrier notifications for watch tap settlements, debits, and security OTPs.
                </p>
              </div>
            </div>

            {smsAlertSaved && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Alerts config saved</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Debit Transaction Alerts</div>
                <p className="text-[11px] text-slate-400">
                  Send immediate SMS dispatch on all smartwatch tap-to-pay debits exceeding ₦500.
                </p>
              </div>
              <button
                onClick={() => setSmsDebitAlerts(!smsDebitAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  smsDebitAlerts ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    smsDebitAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Inbound Credit & Refund Alerts</div>
                <p className="text-[11px] text-slate-400">
                  Notify instantly when funds are refunded from a merchant terminal.
                </p>
              </div>
              <button
                onClick={() => setSmsCreditAlerts(!smsCreditAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  smsCreditAlerts ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    smsCreditAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Security & One-Time Passwords (OTP)</div>
                <p className="text-[11px] text-slate-400">
                  Priority routing through Nigerian telco gateway for Face ID fallback tokens.
                </p>
              </div>
              <button
                onClick={() => setSmsOtpAlerts(!smsOtpAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  smsOtpAlerts ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    smsOtpAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
              Destination mobile number: <strong className="text-amber-400">{phoneNumber}</strong> (Verified)
            </div>

            <button
              onClick={handleSaveSmsAlerts}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-amber-950 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save SMS Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. *SECURITY CENTRE SECTION                                  */}
      {/* ============================================================ */}
      {activeSettingsSection === 'security' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*Security centre</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                    Defensive Status: HARDENED
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Hardware enclaves, cryptographic tamper prevention, and CBN compliance surveillance.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Hardware Keystore Lock
              </div>
              <p className="text-xs text-slate-300">
                Android KeyStore StrongBox & Apple SEP isolate master AES-256 keys inside dedicated cryptographic silicon.
              </p>
              <div className="text-[10px] font-mono text-emerald-400">
                ✓ Non-exportable keys active
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 60-Second Replay Defense
              </div>
              <p className="text-xs text-slate-300">
                Every packet requires a CSPRNG 128-bit unique nonce and UTC timestamp checked against the Lagos server switch.
              </p>
              <div className="text-[10px] font-mono text-cyan-400">
                ✓ Anti-replay window enforced
              </div>
            </div>
          </div>

          {/* Emergency Security Controls */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Emergency Defense Protocol
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div>
                <div className="font-semibold text-white">Smartwatch Remote Token Invalidation</div>
                <div className="text-[11px] text-slate-400">
                  Instantly purge all payment cryptograms from paired Wear OS and Apple Watch devices if lost.
                </div>
              </div>
              <button
                onClick={() => {
                  setRemoteWipeAuthorized(true);
                  setTimeout(() => setRemoteWipeAuthorized(false), 3000);
                }}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 ml-3"
              >
                {remoteWipeAuthorized ? 'Tokens Purged!' : 'Purge Watch Keys'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. *ABOUT (CURRENT VERSION) SECTION                          */}
      {/* ============================================================ */}
      {activeSettingsSection === 'about' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*About (current version of the app)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                    Production Release
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Release build metadata, framework versions, and regulatory licenses.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Application Name:</span>
              <span className="text-xs font-bold text-white font-mono">KudiPulse Tactical Mobile Pay</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Current Version:</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">v3.4.2-tactical (Build 8841)</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Wear OS Engine:</span>
              <span className="text-xs text-slate-200 font-mono">Compose for Wear OS 1.4 / DataClient v18.1</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Apple watchOS Engine:</span>
              <span className="text-xs text-slate-200 font-mono">watchOS 10.0+ / WatchConnectivity (WCSession)</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Companion Framework:</span>
              <span className="text-xs text-slate-200 font-mono">Flutter 3.24.3 / Dart 3.5.3 (iOS & Android)</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-400">Payment Switch Gateway:</span>
              <span className="text-xs text-cyan-400 font-mono">Flutterwave v3 API / NIBSS NIP Switch</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">CBN Compliance License:</span>
              <span className="text-xs text-slate-300 font-mono">Circular BSD/DIR/GEN/LAB/11/025</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. *SWITCH ACCOUNT SECTION (SIGN IN & LOGIN OPTIONS)         */}
      {/* ============================================================ */}
      {activeSettingsSection === 'switch_account' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*Switch account</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Dual Gate (Sign In & Login)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Switch tactical profiles, log into an existing KudiPulse wallet, or sign in to register a new operator account.
                </p>
              </div>
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSwitchAction('options');
                  setSwitchStatusMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  switchAction === 'options'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Profiles
              </button>
              <button
                type="button"
                onClick={() => {
                  setSwitchAction('sign_in');
                  setSwitchStatusMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  switchAction === 'sign_in'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setSwitchAction('login');
                  setSwitchStatusMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  switchAction === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>
          </div>

          {/* Feedback Status Message */}
          {switchStatusMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{switchStatusMessage}</span>
            </div>
          )}

          {/* VIEW A: TWO PRIMARY OPTIONS (SIGN IN vs LOG IN) + SAVED PROFILES */}
          {switchAction === 'options' && (
            <div className="space-y-6">
              {/* Primary Dual Option Gate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPTION 1: SIGN IN */}
                <div
                  onClick={() => setSwitchAction('sign_in')}
                  className="group bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-900/60 hover:border-emerald-500 rounded-3xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-emerald-950/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      New Operator
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Option 1: Sign In (Create / Onboard Account)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Register a new tactical account or merchant entity. Pairs hardware enclave with fresh BVN/NIN credentials.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-1">
                    <span>Open Sign In Portal</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* OPTION 2: LOG IN */}
                <div
                  onClick={() => setSwitchAction('login')}
                  className="group bg-gradient-to-br from-slate-950 to-slate-900 border border-indigo-900/60 hover:border-indigo-500 rounded-3xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-950/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                      Existing Operator
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Option 2: Log In (Existing Account Access)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Switch to an existing registered profile using 6-Digit Password, email, or physical biometric authentication.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 pt-1">
                    <span>Open Log In Portal</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Instant Profile Switcher (Saved Operators) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Instant Operator Switching (1-Click)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">3 Saved Profiles</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {savedProfiles.map((p) => {
                    const isCurrent = p.name === fullName;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-slate-950 border-cyan-500/70 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-slate-800 flex items-center justify-center font-bold text-white text-xs font-mono">
                            {p.initials}
                          </div>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isCurrent
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {isCurrent ? 'Current' : 'Ready'}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <h5 className="text-xs font-bold text-white truncate">{p.name}</h5>
                          <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                          <p className="text-[9.5px] font-mono text-cyan-400 mt-1 truncate">{p.bank}</p>
                        </div>

                        <button
                          type="button"
                          disabled={isCurrent || isSwitchingLoading}
                          onClick={() => {
                            setIsSwitchingLoading(true);
                            setSwitchStatusMessage(`Switching operator session to ${p.name}...`);
                            setTimeout(() => {
                              setFullName(p.name);
                              setEmailAddress(
                                p.identifier.includes('@') ? p.identifier : 'osagiedejoshua024@gmail.com'
                              );
                              if (!p.identifier.includes('@')) {
                                setPhoneNumber(p.identifier);
                              }
                              setIsSwitchingLoading(false);
                              setSwitchStatusMessage(`Operator switched successfully to ${p.name}!`);
                              setTimeout(() => setSwitchStatusMessage(null), 3000);
                            }, 800);
                          }}
                          className={`w-full mt-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? 'bg-slate-900 text-slate-500 cursor-default'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-sm'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{isCurrent ? 'Active Profile' : 'Switch To This'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: SIGN IN PORTAL */}
          {switchAction === 'sign_in' && (
            <div className="bg-slate-950 border border-emerald-900/60 rounded-3xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>Sign In / Create Account Portal</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwitchAction('options')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back to options
                </button>
              </div>

              {/* Account Misbehavior / Security Threat Risk Level Simulator */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white block">Account Behavioral Health Sentinel</span>
                    <span className="text-[10px] text-slate-400">
                      Evaluates terminal safety, failed PIN spikes, or suspicious geolocation jumps.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-slate-400">Behavior State:</span>
                  <select
                    value={accountRiskStatus}
                    onChange={(e) => setAccountRiskStatus(e.target.value as any)}
                    className="bg-slate-950 text-amber-300 px-2 py-1 rounded border border-amber-900/60 font-bold focus:outline-none"
                  >
                    <option value="suspicious_terminal">⚠️ Suspicious Terminal (Triggers Face Scan)</option>
                    <option value="unusual_transfer">🚨 Unusual Transfer Volume (Triggers Face Scan)</option>
                    <option value="failed_auth_strikes">🛑 3x Failed PIN Strikes (Triggers Face Scan)</option>
                    <option value="normal">✅ Normal Safe Behavior (Direct Sign In)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">New Full Name / Entity</label>
                  <input
                    type="text"
                    placeholder="e.g. Capt. Adebayo Olumide"
                    value={switchEmailOrPhone}
                    onChange={(e) => setSwitchEmailOrPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Email or Mobile Number</label>
                  <input
                    type="text"
                    placeholder="operator@kudipulse.ng or +234..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* GOVERNMENT IDENTITY FIELD: NIN OR BVN (TIER 2+ 18+ YEARS) */}
                <div className="space-y-2 md:col-span-2 p-3.5 bg-slate-950 rounded-2xl border border-emerald-900/60">
                  <div className="flex items-center justify-between">
                    <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Government Identity Enrollment (Select NIN or BVN):</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      11 Digits Required
                    </span>
                  </div>

                  {/* Toggle between NIN and BVN */}
                  <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSwitchSignInIdType('nin');
                        setSwitchNinError(null);
                      }}
                      className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        switchSignInIdType === 'nin'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>NIN</span>
                      <span className="text-[9.5px] font-mono opacity-80">(Standard Tier 1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSwitchSignInIdType('bvn');
                        setSwitchNinError(null);
                      }}
                      className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        switchSignInIdType === 'bvn'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>BVN</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-200 border border-cyan-800">
                        Tier 2+ (18+ yrs)
                      </span>
                    </button>
                  </div>

                  {/* Input for selected ID */}
                  {switchSignInIdType === 'nin' ? (
                    <div>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="Enter 11-Digit National Identity Number (e.g. 84910294819)"
                        value={switchNin}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/\D/g, '');
                          setSwitchNin(sanitized);
                          if (sanitized.length === 11) setSwitchNinError(null);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-800 rounded-xl text-white font-mono tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        • <strong>NIN</strong>: NIMC National Identity Number for standard civilian and operator KYC.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="Enter 11-Digit Bank Verification Number (e.g. 22349018247)"
                        value={switchBvn}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/\D/g, '');
                          setSwitchBvn(sanitized);
                          if (sanitized.length === 11) setSwitchNinError(null);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-cyan-700 rounded-xl text-white font-mono tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                      <span className="text-[10px] text-cyan-300/90 mt-1 block">
                        • <strong>BVN</strong>: Required for <strong>Tier 2 and upward accounts (age 18+ years)</strong> for higher tap-to-pay transaction limits under CBN regulations.
                      </span>
                    </div>
                  )}

                  {switchNinError && (
                    <span className="text-[10px] font-mono text-red-400 block animate-pulse">
                      {switchNinError}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">6-Digit Enclave Password</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 6-digit passcode"
                    value={switchPassword}
                    onChange={(e) => setSwitchPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Initial Bank Channel</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500">
                    <option>Zenith Bank PLC</option>
                    <option>Access Bank PLC</option>
                    <option>GTBank (Guaranty Trust)</option>
                    <option>First Bank of Nigeria</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setSwitchAction('login')}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    Switch to Log In
                  </button>
                </span>
                <button
                  type="button"
                  disabled={isSwitchingLoading}
                  onClick={() => {
                    const candidateId = switchSignInIdType === 'bvn' ? switchBvn : switchNin;
                    if (candidateId.length !== 11) {
                      setSwitchNinError(
                        switchSignInIdType === 'bvn'
                          ? 'Valid 11-digit BVN is required for Tier 2+ (18+ years) registration'
                          : 'Valid 11-digit NIN is mandatory to sign in'
                      );
                      return;
                    }

                    // Check if account behavior status triggers Face Recognition to match ID
                    const isMisbehaved = accountRiskStatus !== 'normal';
                    if (isMisbehaved) {
                      setPendingAuthPayload({
                        type: 'sign_in',
                        name: switchEmailOrPhone.trim() || 'NEW OPERATOR',
                        identifier: switchEmailOrPhone.trim() || 'operator@kudipulse.ng',
                        nin: candidateId,
                      });
                      setIsFaceVerificationModalOpen(true);
                      setFaceScanProgress(0);
                      setFaceScanCompleted(false);
                      setFaceScanResult(null);
                      return;
                    }

                    setIsSwitchingLoading(true);
                    setSwitchStatusMessage(
                      `Signing in and registering operator keys with ${switchSignInIdType === 'bvn' ? 'NIBSS BVN Tier-2' : 'NIMC NIN'} clearance...`
                    );
                    setTimeout(() => {
                      if (switchEmailOrPhone.trim()) {
                        setFullName(switchEmailOrPhone.trim());
                      }
                      setIsSwitchingLoading(false);
                      setSwitchStatusMessage(
                        `Sign In Successful! ${switchSignInIdType === 'bvn' ? 'BVN Tier-2 (18+ yrs)' : 'NIN'} Verified and switched to new account.`
                      );
                      setSwitchAction('options');
                      setTimeout(() => setSwitchStatusMessage(null), 3000);
                    }, 1000);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {accountRiskStatus !== 'normal'
                      ? 'Sign In (Requires Face Match)'
                      : 'Sign In & Switch Operator'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW C: LOG IN PORTAL */}
          {switchAction === 'login' && (
            <div className="bg-slate-950 border border-indigo-900/60 rounded-3xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono font-bold text-indigo-400 text-xs uppercase tracking-wider">
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Existing Operator Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwitchAction('options')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back to options
                </button>
              </div>

              {/* Account Misbehavior / Security Threat Risk Level Simulator for Login */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-bold text-white block">Device & Login Threat Intelligence</span>
                    <span className="text-[10px] text-slate-400">
                      Evaluates whether current login attempt shows abnormal device signatures or failed credentials.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-slate-400">Behavior State:</span>
                  <select
                    value={accountRiskStatus}
                    onChange={(e) => setAccountRiskStatus(e.target.value as any)}
                    className="bg-slate-950 text-indigo-300 px-2 py-1 rounded border border-indigo-900/60 font-bold focus:outline-none"
                  >
                    <option value="suspicious_terminal">⚠️ Suspicious Terminal (Enforces Facial Scan)</option>
                    <option value="unusual_transfer">🚨 Unusual Transfer Volume (Enforces Facial Scan)</option>
                    <option value="failed_auth_strikes">🛑 3x Failed PIN Strikes (Enforces Facial Scan)</option>
                    <option value="normal">✅ Normal Safe Behavior (Direct Passcode Login)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Username, Email or Phone</label>
                  <input
                    type="text"
                    placeholder="osagiedejoshua024@gmail.com"
                    value={switchEmailOrPhone}
                    onChange={(e) => setSwitchEmailOrPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">6-Digit Login Passcode</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 6-digit passcode"
                    value={switchPassword}
                    onChange={(e) => setSwitchPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* MANDATORY 11-DIGIT NIN FIELD ON LOGIN */}
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-indigo-400 font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>National Identification Number (NIN) - Mandatory:</span>
                    </label>
                    <span className="text-[10px] font-mono text-indigo-400/90 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                      11 Digits Required
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="Enter 11-Digit National Identity Number (e.g. 84910294819)"
                    value={switchNin}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, '');
                      setSwitchNin(sanitized);
                      if (sanitized.length === 11) setSwitchNinError(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-indigo-800 rounded-xl text-white font-mono tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  {switchNinError && (
                    <span className="text-[10px] font-mono text-red-400 block animate-pulse">
                      {switchNinError}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 block">
                    NIN verified against NIMC citizen registry. If account misbehavior is detected, facial recognition verification is required.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={switchRememberDevice}
                    onChange={(e) => setSwitchRememberDevice(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                  />
                  <span>Remember on this watch hardware</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSwitchStatusMessage('Biometric fingerprint authorization requested...');
                    setTimeout(() => {
                      setSwitchStatusMessage('Biometrics verified! Logged in.');
                      setTimeout(() => setSwitchStatusMessage(null), 3000);
                    }, 1000);
                  }}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Use Biometrics</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Need a new account?{' '}
                  <button
                    type="button"
                    onClick={() => setSwitchAction('sign_in')}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    Switch to Sign In
                  </button>
                </span>
                <button
                  type="button"
                  disabled={isSwitchingLoading}
                  onClick={() => {
                    if (switchNin.length !== 11) {
                      setSwitchNinError('Valid 11-digit NIN is mandatory to log in');
                      return;
                    }

                    // Check if account behavior status triggers Face Recognition to match NIN
                    const isMisbehaved = accountRiskStatus !== 'normal';
                    if (isMisbehaved) {
                      setPendingAuthPayload({
                        type: 'login',
                        name: switchEmailOrPhone.includes('@') ? fullName : switchEmailOrPhone.trim() || fullName,
                        identifier: switchEmailOrPhone.trim() || emailAddress,
                        nin: switchNin,
                      });
                      setIsFaceVerificationModalOpen(true);
                      setFaceScanProgress(0);
                      setFaceScanCompleted(false);
                      setFaceScanResult(null);
                      return;
                    }

                    setIsSwitchingLoading(true);
                    setSwitchStatusMessage('Verifying credentials with central security gateway...');
                    setTimeout(() => {
                      if (switchEmailOrPhone.trim()) {
                        setEmailAddress(switchEmailOrPhone.trim());
                      }
                      setIsSwitchingLoading(false);
                      setSwitchStatusMessage('Log In Successful! Account active.');
                      setSwitchAction('options');
                      setTimeout(() => setSwitchStatusMessage(null), 3000);
                    }, 900);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950 flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {accountRiskStatus !== 'normal'
                      ? 'Log In (Requires Face Match)'
                      : 'Log In to Account'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. *|CLOSE ACCOUNT| SECTION                                  */}
      {/* ============================================================ */}
      {activeSettingsSection === 'close_account' && (
        <div className="bg-red-950/30 border border-red-800/60 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-red-900/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>*|Close account|</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                    Irreversible Action
                  </span>
                </h3>
                <p className="text-xs text-red-200/80">
                  Permanently terminate KudiPulse smartwatch tap-to-pay wallet, revoke enclaves, and unpair devices.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-red-900/50 rounded-2xl space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-red-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Consequences of Closing Your Tactical Pay Account:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
              <li>All tokenized payment keys stored inside Android KeyStore & Apple Secure Enclave are permanently erased.</li>
              <li>Your paired smartwatch (Wear OS / watchOS) will no longer function for contactless terminal tap-to-pay.</li>
              <li>NIBSS NQR payment mandates and recurring merchant subscriptions are cancelled.</li>
              <li>Your transaction history receipts can still be requested through CBN-authorized bank clearing channels.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Reason for Closure (Optional):
            </label>
            <select
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="Switching to another device">Switching to another smartwatch or phone</option>
              <option value="No longer residing in Nigeria">No longer residing in Nigeria / Leaving NGN clearing zone</option>
              <option value="Security concerns">Security / Lost physical device</option>
              <option value="Other">Other reasons</option>
            </select>
          </div>

          {/* Alternative Suggestion: Switch Account Instead of Closing */}
          <div className="p-4 bg-slate-950/90 border border-cyan-900/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Do you simply need to switch accounts?</span>
                <span className="text-[11px] text-slate-400">
                  You do not need to permanently terminate your wallet. You can switch operator sessions, sign in, or log into another profile.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSettingsSection('switch_account');
                setSwitchAction('options');
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Go to *Switch Account (Sign In / Login)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="py-3 px-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-red-950 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Proceed to *|Close account|</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Account Closure */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-red-400 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono font-bold text-sm">
                <AlertOctagon className="w-5 h-5" />
                <span>Confirm Account Termination</span>
              </div>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you completely certain? To prevent accidental closure, please type <strong className="text-red-400 font-mono">CLOSE</strong> in the box below to authorize hardware key destruction:
            </p>

            <input
              type="text"
              placeholder="Type CLOSE to confirm"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-800/80 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCloseAccount}
                disabled={confirmDeleteText.trim().toUpperCase() !== 'CLOSE'}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950"
              >
                Permanently Close Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. FACIAL RECOGNITION NIN-MATCH VERIFICATION MODAL           */}
      {/* (Triggered when account behavioral health detects anomaly)  */}
      {/* ============================================================ */}
      {isFaceVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-600/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-cyan-400 font-mono font-bold text-sm">
                <ScanFace className="w-5 h-5 text-cyan-400" />
                <span>NIMC Biometric Facial Verification</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFaceVerificationModalOpen(false);
                  setIsFaceScanning(false);
                  setFaceScanCompleted(false);
                  setFaceScanResult(null);
                  setPendingAuthPayload(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Context on why Face Verification was triggered */}
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">
                  Risk Triggered: {accountRiskStatus.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-[11px] text-amber-200/90 leading-tight block mt-0.5">
                  Due to recent abnormal account behavior or unfamiliar device sign-in, NIMC requires live 3D facial recognition to verify your physical face matches NIN: <strong className="font-mono text-white">{switchNin}</strong>.
                </span>
              </div>
            </div>

            {/* 5 Interactive Liveness Gesture Steps Status Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Liveness Checks ({Object.values(completedLivenessSteps).filter(Boolean).length}/5 Passed)</span>
                </span>
                <span className="text-cyan-400 font-bold">{faceScanProgress}% Completed</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${faceScanProgress}%` }}
                ></div>
              </div>

              {/* 5 Interactive Gesture Badges */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {livenessStepsList.map((step, idx) => {
                  const isDone = completedLivenessSteps[step.id];
                  const isCurrent = isFaceScanning && currentLivenessStep === idx;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handlePerformManualGesture(step.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        isDone
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-sm shadow-emerald-950'
                          : isCurrent
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 scale-105 animate-pulse'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                      title={`Click to simulate: ${step.title}`}
                    >
                      <span className="text-base mb-0.5">{step.icon}</span>
                      <span className="text-[9.5px] font-bold font-mono uppercase tracking-tight line-clamp-1">
                        {step.id === 'nod' ? 'Nod' : step.id === 'blink' ? 'Blink' : step.id === 'mouth' ? 'Mouth' : step.id === 'smile' ? 'Smile' : 'Turn'}
                      </span>
                      {isDone ? (
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
                      ) : (
                        <span className="text-[8px] text-slate-500 mt-0.5">{idx + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Facial Camera Reticle with Realtime Visual Prompts */}
            <div className="relative w-full h-56 bg-slate-950 rounded-2xl border-2 border-dashed border-cyan-800/80 flex flex-col items-center justify-center overflow-hidden">
              {/* Corner Target Reticles */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

              {/* Active Gesture Directional Overlay Guide */}
              {isFaceScanning && (
                <div className="absolute top-3 inset-x-0 flex justify-center z-10">
                  <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/60 text-cyan-300 font-mono text-xs font-bold animate-pulse shadow-lg flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>{livenessActionFeedback}</span>
                  </span>
                </div>
              )}

              {/* Live Scan Line Animation */}
              {isFaceScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[bounce_1.5s_infinite] shadow-lg shadow-cyan-400/80"></div>
              )}

              {/* Facial Silhouette Target with Dynamic Gesture Hints */}
              <div className="relative flex flex-col items-center justify-center">
                <div
                  className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    faceScanCompleted
                      ? 'border-emerald-400 bg-emerald-950/40 scale-105'
                      : isFaceScanning
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-slate-700 bg-slate-900/60'
                  }`}
                >
                  {faceScanCompleted ? (
                    <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-in zoom-in" />
                  ) : isFaceScanning ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      {currentLivenessStep === 0 && <span className="text-3xl animate-bounce">↕️</span>}
                      {currentLivenessStep === 1 && <span className="text-3xl animate-pulse">👁️</span>}
                      {currentLivenessStep === 2 && <span className="text-3xl scale-125 transition-transform">👄</span>}
                      {currentLivenessStep === 3 && <span className="text-3xl animate-spin-slow">😊</span>}
                      {currentLivenessStep >= 4 && <span className="text-3xl animate-[pulse_1s_infinite]">↔️</span>}
                      <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                        {currentLivenessStep === 0
                          ? 'Nod Head'
                          : currentLivenessStep === 1
                          ? 'Blink Eyes'
                          : currentLivenessStep === 2
                          ? 'Open Mouth'
                          : currentLivenessStep === 3
                          ? 'Smile'
                          : 'Turn Left/Right'}
                      </span>
                    </div>
                  ) : (
                    <ScanFace className="w-14 h-14 text-slate-600" />
                  )}
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs font-mono font-bold text-white block">
                    {faceScanCompleted
                      ? 'NIN & All 5 Liveness Tests Passed!'
                      : isFaceScanning
                      ? livenessActionFeedback
                      : 'Press Start or Tap gestures above'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    NIMC Identity: {fullName} • NIN: {switchNin}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Result Stats */}
            {faceScanCompleted && faceScanResult && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-2xl space-y-1.5 text-xs font-mono animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Liveness Verification:</span>
                  <span className="text-emerald-400 font-bold">5/5 GESTURES PASSED (Nod, Blink, Mouth, Smile, Turn)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Biometric Match Score:</span>
                  <span className="text-emerald-400 font-bold">{faceScanResult.confidenceScore}% (NIN Matched)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">NIMC Security Clearance:</span>
                  <span className="text-emerald-300 font-bold">APPROVED & AUTHENTICATED</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 truncate">
                  <span>Enclave Token:</span>
                  <span className="truncate max-w-[200px]">{faceScanResult.biometricToken}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {/* Optional Manual Test Control for user convenience */}
              {!faceScanCompleted && isFaceScanning && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTurnDirection((prev) => (prev === 'left' ? 'right' : 'left'));
                      handlePerformManualGesture('turn');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Turn {turnDirection === 'left' ? 'Left ⬅️' : 'Right ➡️'}</span>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsFaceVerificationModalOpen(false);
                    setIsFaceScanning(false);
                    setFaceScanCompleted(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                {!faceScanCompleted ? (
                  <button
                    type="button"
                    onClick={triggerFaceVerificationScan}
                    disabled={isFaceScanning}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950 flex items-center gap-2 cursor-pointer"
                  >
                    {isFaceScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Running Liveness Scan...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Start 5-Gesture Verification</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishFaceVerification}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize & Complete Switch</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADDITIONAL HARDWARE & TELEMETRY CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Feedback Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Haptic & Audio Signals</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-2xl">
              <div>
                <div className="text-xs font-semibold text-white">Smartwatch Dual Haptic Pulse</div>
                <div className="text-[10px] text-slate-400">Vibrate watch crown upon NIBSS settlement confirmation</div>
              </div>
              <button
                onClick={onToggleHaptic}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  hapticEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hapticEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-2xl">
              <div>
                <div className="text-xs font-semibold text-white">Synthesized Audio Bell Chime</div>
                <div className="text-[10px] text-slate-400">Play terminal approval ding via Web Audio API</div>
              </div>
              <button
                onClick={onToggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Cryptography Policy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Cryptographic Keystore Specs</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Wear OS Keystore:</span>
              <span className="text-emerald-400 font-bold">Android KeyStore (StrongBox)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">watchOS Enclave:</span>
              <span className="text-cyan-400 font-bold">Apple SEP (kSecAccessControl)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Biometric Fallback:</span>
              <span className="text-amber-400">TrueDepth 3D Reticle</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">NIBSS Channel:</span>
              <span className="text-slate-200">ISO-8583 / NQR EMVCo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
