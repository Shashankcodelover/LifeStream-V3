import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, Filter, Award, ShieldCheck, CheckCircle2,
  ExternalLink, Building2, MapPin, DollarSign, Clock, Zap,
  ChevronRight, X, Download, FileText, Sparkles, UserCheck, Star
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function RecruiterPortalView() {
  const [candidates, setCandidates] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [minPercentile, setMinPercentile] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Selected Candidate for Dossier Drawer
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Enterprise Procurement Modal State
  const [showProcureModal, setShowProcureModal] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState('TIER-REGIONAL-NETWORK');
  const [orgName, setOrgName] = useState('San Francisco Trauma Network');
  const [contactEmail, setContactEmail] = useState('procurement@sfhealth.org');
  const [provisionedLicense, setProvisionedLicense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Candidates & Tiers
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (minPercentile > 0) queryParams.set('minPercentile', minPercentile);
        if (selectedBadge !== 'ALL') queryParams.set('badge', selectedBadge);
        if (selectedSpecialty !== 'ALL') queryParams.set('specialty', selectedSpecialty);
        if (searchQuery) queryParams.set('q', searchQuery);

        const data = await resilientFetch(`/api/recruiter/candidates?${queryParams.toString()}`);
        if (data && data.candidates) {
          setCandidates(data.candidates);
        }

        const tierData = await resilientFetch('/api/recruiter/tiers');
        if (tierData && tierData.tiers) {
          setTiers(tierData.tiers);
        }
      } catch (err) {
        console.warn('Failed to fetch recruiter data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, minPercentile, selectedBadge, selectedSpecialty]);

  // Handle Enterprise License Procurement
  const handleProcureLicense = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await resilientFetch('/api/recruiter/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          tierId: selectedTierId,
          organizationName: orgName,
          contactEmail
        })
      });

      if (res && res.license) {
        setProvisionedLicense(res.license);
      }
    } catch (err) {
      console.error('Procurement error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgPercentile = candidates.length > 0
    ? (candidates.reduce((sum, c) => sum + c.percentile, 0) / candidates.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafd] text-[#202124] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Standard Header */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124]">
              Enterprise Recruiter & Clinical Talent Clearinghouse
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
              LinkedIn Recruiter & RippleMatch Standard
            </span>
          </div>
          <p className="text-sm text-[#5f6368] max-w-3xl">
            Direct institutional access to certified Trauma Resuscitation Directors, Autonomous Drone Flight Engineers, and Immunohematologists calibrated across national proctored benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setProvisionedLicense(null);
              setShowProcureModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-xl shadow-sm transition-all"
          >
            <Building2 className="w-4 h-4" />
            Procure Enterprise License
          </button>
        </div>
      </div>

      {/* Recruiter KPI Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
            <span>Verified Talent Pool</span>
            <UserCheck className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="text-2xl font-extrabold text-[#202124] mt-1 tracking-tight">
            {candidates.length} <span className="text-xs font-normal text-[#5f6368]">Specialists</span>
          </div>
          <div className="text-[10px] text-[#34a853] font-medium mt-1">100% Proctored Verified</div>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
            <span>Mean Candidate Percentile</span>
            <Award className="w-4 h-4 text-[#fbbc04]" />
          </div>
          <div className="text-2xl font-extrabold text-[#202124] mt-1 tracking-tight">
            {avgPercentile}th
          </div>
          <div className="text-[10px] text-[#5f6368] mt-1">National Distribution</div>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
            <span>Enterprise Seats</span>
            <Building2 className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="text-2xl font-extrabold text-[#202124] mt-1 tracking-tight">
            25 <span className="text-xs font-normal text-[#5f6368]">Active</span>
          </div>
          <div className="text-[10px] text-[#34a853] font-medium mt-1">Level-1 Trauma Network</div>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
            <span>Credential Integrity</span>
            <ShieldCheck className="w-4 h-4 text-[#34a853]" />
          </div>
          <div className="text-2xl font-extrabold text-[#34a853] mt-1 tracking-tight">
            SHA-256
          </div>
          <div className="text-[10px] text-[#5f6368] mt-1">Tamper-Proof Audit Seals</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5f6368]" />
            <input
              type="text"
              placeholder="Search by candidate name, clinical skill, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
          </div>

          {/* Competency Tier Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] bg-white text-[#202124]"
            >
              <option value="ALL">All Competency Tiers</option>
              <option value="MASTER_DIRECTOR_DISTINCTION">Master Director Distinction (Top 5%)</option>
              <option value="CERTIFIED_SENIOR_COORDINATOR">Certified Senior Coordinator</option>
              <option value="QUALIFIED_PRACTITIONER">Qualified Practitioner</option>
            </select>
          </div>

          {/* Specialty Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] bg-white text-[#202124]"
            >
              <option value="ALL">All Clinical Specialties</option>
              <option value="Trauma Surgery & MTP 1:1:1">Trauma Surgery & MTP 1:1:1</option>
              <option value="Airspace Vector Optimization">Airspace Vector Optimization</option>
              <option value="Rare Antigen Alloimmunization">Rare Antigen Alloimmunization</option>
              <option value="Thermodynamics & IoT Cold-Chain">Thermodynamics & IoT Cold-Chain</option>
            </select>
          </div>
        </div>

        {/* Minimum Percentile Slider */}
        <div className="pt-2 border-t border-[#f1f3f4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#5f6368]">Min Percentile:</span>
            <span className="text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full">
              ≥ {minPercentile}th Percentile
            </span>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="range"
              min="0"
              max="99"
              step="5"
              value={minPercentile}
              onChange={(e) => setMinPercentile(Number(e.target.value))}
              className="w-full accent-[#1a73e8] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Candidate Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map(candidate => (
          <div
            key={candidate.id}
            className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header: Avatar, Name, Verified Badge */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#dadce0]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#202124] truncate">{candidate.name}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
                  </div>
                  <div className="text-xs text-[#5f6368] truncate">{candidate.title}</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#70757a] mt-0.5">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{candidate.hospital}</span>
                  </div>
                </div>
              </div>

              {/* Percentile Pill & Competency Badge */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f8fafd] border border-[#dadce0] mb-3">
                <div>
                  <div className="text-[10px] text-[#5f6368] font-medium">National Rank</div>
                  <div className="text-sm font-extrabold text-[#1a73e8]">
                    {candidate.percentile}th <span className="text-[10px] font-normal text-[#5f6368]">Percentile</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    candidate.badge === 'MASTER_DIRECTOR_DISTINCTION'
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
                      : 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                  }`}>
                    {candidate.badge === 'MASTER_DIRECTOR_DISTINCTION' ? 'Master Distinction' : 'Senior Coordinator'}
                  </span>
                  <div className="text-[10px] text-[#5f6368] mt-0.5">
                    Solve Speed: {candidate.solveSpeedSeconds}s
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {candidate.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f1f3f4] text-[#3c4043]">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#f1f3f4] text-[#5f6368]">
                    +{candidate.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#f1f3f4] flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#202124]">
                {candidate.expectedSalary}
              </span>
              <button
                onClick={() => setSelectedCandidate(candidate)}
                className="flex items-center gap-1 text-xs font-semibold text-[#1a73e8] hover:text-[#1557b0] transition-colors"
              >
                <span>View Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Dossier Slide-Over Modal / Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#dadce0]">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#1a73e8]" />
                  <span className="font-bold text-base text-[#202124]">Verified Candidate Dossier</span>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Bio */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-16 h-16 rounded-full object-cover border border-[#dadce0]"
                />
                <div>
                  <h2 className="text-base font-bold text-[#202124]">{selectedCandidate.name}</h2>
                  <p className="text-xs text-[#5f6368] font-medium">{selectedCandidate.title}</p>
                  <p className="text-xs text-[#70757a] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {selectedCandidate.location}
                  </p>
                </div>
              </div>

              {/* Assessment Metrics Card */}
              <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#dadce0] space-y-3">
                <div className="text-xs font-bold text-[#202124]">Proctored Arena Benchmark Score</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white border border-[#dadce0]">
                    <div className="text-[10px] text-[#5f6368]">Percentile</div>
                    <div className="text-lg font-black text-[#1a73e8]">{selectedCandidate.percentile}th</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#dadce0]">
                    <div className="text-[10px] text-[#5f6368]">Final Score</div>
                    <div className="text-lg font-black text-[#34a853]">{selectedCandidate.finalScore}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#dadce0]">
                    <div className="text-[10px] text-[#5f6368]">Solve Speed</div>
                    <div className="text-lg font-black text-[#202124]">{selectedCandidate.solveSpeedSeconds}s</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#5f6368] flex items-center justify-between pt-1">
                  <span>Certificate ID:</span>
                  <span className="font-mono font-bold text-[#1a73e8]">{selectedCandidate.certificateId}</span>
                </div>
              </div>

              {/* Clinical Biography */}
              <div>
                <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-1.5">Executive Summary</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">
                  {selectedCandidate.bio}
                </p>
              </div>

              {/* Verified Competencies */}
              <div>
                <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">Verified Competency Matrix</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCandidate.skills.map((skill, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#f1f3f4] text-xs font-medium text-[#202124] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34a853]" />
                      <span className="truncate">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#dadce0] flex gap-3">
              <button
                onClick={() => {
                  alert(`Interview invitation dispatched to ${selectedCandidate.name}.`);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-xl transition-colors"
              >
                Schedule Clinical Interview
              </button>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2.5 text-xs font-medium text-[#5f6368] bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise B2B Procurement Modal */}
      {showProcureModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#dadce0]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1a73e8]" />
                <h2 className="font-bold text-base text-[#202124]">
                  Procure Institutional Enterprise License
                </h2>
              </div>
              <button
                onClick={() => setShowProcureModal(false)}
                className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!provisionedLicense ? (
              <form onSubmit={handleProcureLicense} className="space-y-4">
                {/* Subscription Tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiers.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTierId(t.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                        selectedTierId === t.id
                          ? 'border-[#1a73e8] bg-[#e8f0fe] shadow-sm'
                          : 'border-[#dadce0] bg-white hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#202124]">{t.name}</span>
                        {t.recommended && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#fbbc04] text-black">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-black text-[#1a73e8] my-1">
                        ${t.priceMonthly.toLocaleString()} <span className="text-[10px] font-normal text-[#5f6368]">/mo</span>
                      </div>
                      <div className="text-[10px] text-[#5f6368]">{t.seatsIncluded} Seats Included</div>
                    </div>
                  ))}
                </div>

                {/* Organization Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-[#5f6368] block mb-1">Organization / Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5f6368] block mb-1">Procurement Contact Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8]"
                    />
                  </div>
                </div>

                {/* Procurement Submit */}
                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProcureModal(false)}
                    className="px-4 py-2 text-xs font-medium text-[#5f6368] bg-[#f1f3f4] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Provisioning Key...' : 'Confirm & Provision License'}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Tax Receipt & Key Output */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#e6f4ea] border border-[#ceead6] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#137333] shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-[#137333]">Enterprise License Successfully Provisioned</h3>
                    <p className="text-[11px] text-[#3c4043]">
                      Active subscription recorded. License key is now active across all LifeStream API endpoints.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#dadce0] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5f6368]">License Key:</span>
                    <span className="font-mono font-bold text-[#1a73e8]">{provisionedLicense.licenseKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f6368]">Invoice Number:</span>
                    <span className="font-mono font-bold text-[#202124]">{provisionedLicense.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f6368]">Organization:</span>
                    <span className="font-semibold text-[#202124]">{provisionedLicense.organizationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f6368]">Tier & Seats:</span>
                    <span className="font-semibold text-[#202124]">{provisionedLicense.tierName} ({provisionedLicense.seatsAllocated} Seats)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f6368]">Billed Amount:</span>
                    <span className="font-bold text-[#34a853]">${provisionedLicense.amountBilled}/month</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#dadce0] text-[10px] text-[#70757a]">
                    <span>SHA-256 Compliance Hash:</span>
                    <span className="font-mono truncate max-w-[240px]">{provisionedLicense.complianceHash}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowProcureModal(false)}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1a73e8] rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
