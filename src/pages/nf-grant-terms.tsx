import type { ReactNode } from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { Default } from '@/layouts/Default';
import { Meta } from '@/layouts/Meta';
import { getURL } from '@/utils/validUrl';

const PUBLISHED_DATE = '30 July 2026';

function Term({ children }: { children: ReactNode }) {
  return (
    <>
      &ldquo;
      <strong className="font-semibold text-slate-900">{children}</strong>
      &rdquo;
    </>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function Clause({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-16 shrink-0 font-medium text-slate-900">
        {number}.
      </span>
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
    </div>
  );
}

const listItemGap =
  'list-outside space-y-3 pl-10 [&>li]:pl-4 [&>li]:marker:text-slate-900';

function AlphaList({ children }: { children: ReactNode }) {
  return <ol className={`list-[lower-alpha] ${listItemGap}`}>{children}</ol>;
}

function RomanList({ children }: { children: ReactNode }) {
  return (
    <ol className={`mt-3 list-[lower-roman] ${listItemGap}`}>{children}</ol>
  );
}

function NumberedList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ol className={`list-decimal ${listItemGap} ${className}`.trim()}>
      {children}
    </ol>
  );
}

function Definition({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-6">
      <dt className="font-bold text-slate-900">{term}</dt>
      <dd className="space-y-3">{children}</dd>
    </div>
  );
}

export default function NfGrantTerms() {
  return (
    <Default
      meta={
        <Meta
          title={`NEAR Foundation Grant Program Terms & Conditions | ${PROJECT_NAME}`}
          description="Terms and Conditions for the NEAR Foundation Grant Program on NEARN."
          canonical={`${getURL()}nf-grant-terms`}
        />
      }
    >
      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            NEAR Foundation Grant Program
          </h1>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: {PUBLISHED_DATE}
          </p>
        </header>

        <div className="space-y-10 text-base leading-7 text-slate-700 [&_a]:text-brand-green [&_a]:underline">
          {/* prettier-ignore */}
          <p>
            These terms and conditions are entered into by and between you (<Term>Recipient</Term> or <Term>you</Term> or <Term>your</Term>) and NEAR Foundation (<Term>Foundation</Term>, <Term>we</Term> or <Term>us</Term>). Please read these terms and conditions (<Term>Terms</Term> or <Term>Agreement</Term>)) carefully before submitting your Proposal to the Relevant Community (as defined below) under the Foundation&apos;s Grant Program (<Term>Grant</Term>). By proceeding with the submission of your Proposal you are accepting to be bound by these Terms. These Terms, together with any documents they expressly incorporate by reference, govern your receipt and use of the Grant.
          </p>

          <Section number={1} title="Introduction">
            <p>
              The Foundation promotes the growth of the NEAR community and its
              associate ecosystem, and offers grants to support the community in
              helping further these goals. The Grant shall be used according to
              the approved Proposal, to further the development of the NEAR
              Protocol and its associated Ecosystem (as defined below) (
              <Term>Purpose</Term>). The Foundation provides the Grant under
              these Terms and the Grant shall be used exclusively for the
              Purpose.
            </p>
            <p>
              The Foundation reserves the right to modify, amend and cancel the
              Grant Programme at any time at its absolute discretion.
            </p>
          </Section>

          <Section number={2} title="Grant Payment">
            <div className="space-y-4">
              <Clause number="2.1">
                <p>
                  The Grant will be disbursed in accordance with the
                  Foundation&apos;s policies upon the acceptance of a NEARN
                  Payment Proposal (defined below) by the Foundation and receipt
                  of an invoice for the relevant amount.
                </p>
              </Clause>
              <Clause number="2.2">
                <p>
                  You must use the Grant exclusively for the Purposes and in
                  accordance with these Terms. Any deviation from the
                  agreed-upon use of the Grant without prior written approval
                  from the Foundation and the Relevant Community will constitute
                  a breach of these Terms.
                </p>
              </Clause>
              <Clause number="2.3">
                <p>
                  The Foundation reserves the right to request a detailed report
                  on the use of the Grant funds. You are required to provide
                  such a report within reasonable time. Failure by you to comply
                  with the terms of the Grant payment, including but not limited
                  to the misuse of funds or failure to provide required reports,
                  may result in the suspension or termination of the Grant and
                  the requirement to repay any disbursed funds.
                </p>
              </Clause>
              <Clause number="2.4">
                <p>
                  The Foundation reserves the right to conduct due diligence in
                  respect of you as it sees fit, which may include &ldquo;Know
                  Your Client&rdquo; (KYC), &ldquo;Know Your Business&rdquo;
                  (KYB), anti-money laundering (AML), and/or sanctions, checks (
                  <Term>Due Diligence</Term>). The payment of a NEARN Payment
                  Proposal is conditional on satisfactory completion of Due
                  Diligence. You agree to cooperate with the Foundation in
                  respect of Due Diligence.
                </p>
              </Clause>
              <Clause number="2.5">
                <p>
                  Grant payments denominated in USD, with payout being in NEAR
                  Tokens, will be converted to NEAR Tokens based on the spot
                  price at the time the payment proposal is created by the
                  sponsor team in the NEAR Treasury Tool (the{' '}
                  <Term>NEARN Payment Proposal</Term>). The Foundation, at its
                  sole discretion, aims to pay outstanding NEARN Payment
                  Proposals swiftly however, the Recipient acknowledges and
                  accepts that price fluctuations can and do occur and that the
                  time at which the NEARN Payment Proposal is created in the
                  NEAR Treasury Tool is the relevant time at which the currency
                  conversion rate between USD and NEAR Tokens will apply. The
                  Foundation will not be held liable for any fluctuations in the
                  price of NEAR Tokens.
                </p>
              </Clause>
              <Clause number="2.6">
                <p>
                  All costs relating to pursuing the Purpose will be borne by
                  you.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={3} title="Tokens as Grant Payment">
            <Clause number="3.1">
              <p>
                If Tokens are used to pay the Grant, the Recipient acknowledges
                and warrants that:
              </p>
              <AlphaList>
                <li>
                  the Foundation is not liable for any losses due to events
                  outside its control or incorrect information provided by the
                  Recipient (including, without limitation, an incorrect address
                  for the Wallet Address);
                  <RomanList>
                    <li>
                      the Recipient understands the risks involved in the
                      development of the protocol on which the Tokens existing (
                      <Term>Relevant Protocol</Term>), including, technological,
                      regulatory, and market risks associated with the Relevant
                      Protocol may not function as intended; and
                    </li>
                    <li>
                      the Recipient will receive such Tokens for its own benefit
                      and not for speculation or profit.
                    </li>
                  </RomanList>
                </li>
                <li>
                  NEAR Token Lock-Up and Vesting
                  <RomanList>
                    <li>
                      NEAR Tokens used for the Grant may be subject to a linear
                      release Lock-Up, with technical restrictions on
                      transferability. Any such restrictions will be confirmed
                      to you ahead of any transfer of Tokens.
                    </li>
                  </RomanList>
                </li>
                <li>
                  Wallet Address
                  <RomanList>
                    <li>
                      You are responsible for confirming the correct wallet
                      address (<Term>Wallet Address</Term>), which must be
                      accessible only through your private key. The Foundation
                      bears no responsibility for Token loss due to an
                      incorrect, inaccessible, or defective Wallet Address.
                    </li>
                  </RomanList>
                </li>
                <li>
                  Payment Suspension
                  <RomanList>
                    <li>
                      The Foundation may suspend or withhold payments if the
                      project is not progressing satisfactorily or if you
                      violate these Terms.
                    </li>
                  </RomanList>
                </li>
              </AlphaList>
            </Clause>
          </Section>

          <Section number={4} title="Risk Factors">
            <Clause number="4.1">
              <p>
                The Recipient acknowledges the following risk factors associated
                with the Tokens:
              </p>
              <div className="space-y-3">
                <Clause number="4.1.1">
                  <p>
                    the Tokens are subject to volatility and fluctuations in
                    cryptocurrency markets;
                  </p>
                </Clause>
                <Clause number="4.1.2">
                  <p>
                    regulatory uncertainty, changes or actions could have a
                    negative impact on the value of the Tokens, and may result
                    in the Tokens having no value;
                  </p>
                </Clause>
                <Clause number="4.1.3">
                  <p>
                    the Tokens are subject to the risks associated with their
                    Relevant Protocol, which may not be fully developed or
                    function as intended, may be defective, and may fail to
                    attract sufficient interest from users; and
                  </p>
                </Clause>
                <Clause number="4.1.4">
                  <p>
                    the Tokens carry no rights, express or implied, other than
                    the right to use the Tokens for their intended purpose as a
                    means to interact with the Relevant Protocol.
                  </p>
                </Clause>
              </div>
            </Clause>
          </Section>

          <Section number={5} title="Recipient Obligations">
            <p>In exchange for the Grant, you undertake that you will:</p>
            <NumberedList>
              <li>
                use the Grant solely for the Purpose and for no other purpose;
              </li>
              <li>
                perform your obligations under these Terms:
                <AlphaList>
                  <li>in accordance with all Applicable Laws;</li>
                  <li>using reasonable skill, care and diligence; and</li>
                  <li>
                    in accordance with good industry practice as fitting for the
                    development and operation of the Purpose;
                  </li>
                </AlphaList>
              </li>
              <li>use its best efforts to achieve the Purpose;</li>
              <li>
                ensure that any Software is free of defects in all material
                respects and comply with all Applicable Laws and any and all
                specifications and requirements set by the Foundation;
              </li>
              <li>
                ensure that any underlying smart contract infrastructure is
                robustly audited and tested in accordance with best industry
                practice prior to its launch and, if and when appropriate, at
                regular intervals thereafter (in each case, at your own cost,
                unless approved otherwise in the approved Proposal);
              </li>
              <li>
                on behalf of third parties/by way of a business have no power to
                invest any of the Grant amount. No interest or other income may
                be generated from the Grant;
              </li>
              <li>
                not materially alter the scope, features or direction (as
                applicable) of its business in relation to the Grant, without
                obtaining prior written approval from the Foundation;
              </li>
              <li>
                cooperate with the Foundation in all matters relating to the
                Purpose, and the Grant, and comply with the Foundation&apos;s
                instructions;
              </li>
              <li>
                at all times conduct your business, and activities, in
                connection with these Terms in the best interest of, with good
                faith with respect to, and in such a manner to promote a good
                image of and enhance public relations for, the Foundation, the
                NEAR Technology, and the NEAR Ecosystem;
              </li>
              <li>
                not engage in any unfair or deceptive trade practice involving
                the Purpose, the Software, the Foundation, the NEAR Technology,
                the NEAR Token, or the NEAR Ecosystem;
              </li>
              <li>
                not make any false, misleading, negative, prejudicial, or
                disparaging representations or statements about the Foundation,
                the NEAR Technology, the NEAR Token and/or the NEAR Ecosystem
                (in connection with the Grant or otherwise);
              </li>
              <li>
                will not become involved in or become associated with (whether
                directly or indirectly) any situation or activity (whether
                caused by you or a third party) which tends, in the reasonable
                opinion of the Foundation, to have a negative effect on the
                reputation or standing of the Foundation (or any aspect of its
                activities), the NEAR Technology, the NEAR Token, or the NEAR
                Ecosystem;
              </li>
              <li>
                where the Purpose involve software, you will provide to the
                Foundation at a minimum read-only access to your private
                codebase, if requested by the Foundation;
              </li>
              <li>
                promptly notify the Foundation in writing if you are no longer
                actively pursuing the completion of the Purpose, and shall
                provide detailed reasons as part of such notification;
              </li>
              <li>
                promptly notify the Foundation in writing if you intend to
                deviate from the agreed specifications of the the Purpose and
                shall provide detailed reasons and proposed alternatives as part
                of such notification;
              </li>
              <li>
                regularly update the relevant Supervisor in writing (e.g. by
                email or via the NEARN submission) on the progress of completion
                of the Purpose;
              </li>
              <li>
                maintain clear and regular communication with the relevant
                Supervisor on the progress of achieving the Purpose s and
                provide timely and accurate information to the relevant
                Supervisor; and
              </li>
              <li>
                promptly provide written notice to the Foundation of any claims,
                investigations or proceedings, which, if determined adversely,
                could reasonably be expected to result in a material adverse
                effect on the ability of you to achieve the Purpose or perform
                any of the other obligations under these Terms.
              </li>
            </NumberedList>
            <p>
              Failure to comply with these obligations may result in the
              suspension or termination of your access to the Grant, at the sole
              discretion of the Foundation.
            </p>
          </Section>

          <Section number={6} title="Review of Achievement by the Foundation">
            <div className="space-y-4">
              <Clause number="6.1">
                <p>
                  The Foundation may conduct periodic reviews of the
                  achievements by you in relation to the Grant provided under
                  these Terms. The purpose of these reviews is to ensure that
                  you are utilizing the Grant in accordance with the agreed
                  terms and to assess the effectiveness of the Grant in
                  achieving your objectives.
                </p>
              </Clause>
              <Clause number="6.2">
                <p>
                  The review process shall include, but not be limited to, an
                  evaluation of your compliance with these Terms, the quality
                  and impact of the Grant utilized, and any feedback from you
                  regarding the Grant. The Foundation reserves the right to
                  modify, suspend, or terminate the Grant provided to you based
                  on the outcome of these reviews.
                </p>
              </Clause>
              <Clause number="6.3">
                <p>
                  The Foundation may conduct periodic reviews of the
                  achievements by the Recipient in relation to any Grant
                  provided under these or prior Terms. The purpose of these
                  reviews is to ensure that the Grant is being utilized in
                  accordance with the agreed terms and to assess the
                  effectiveness of the Grant in achieving its objectives. The
                  review process may include an evaluation of the
                  Recipient&apos;s compliance with these Terms, the quality and
                  the impact of the Grant utilization. Based on the outcome of
                  these reviews, including but not limited to instances of
                  unsatisfactory performance, misuse of funds, or failure to
                  provide required reports, the Foundation reserves the right to
                  refuse consideration of any future grant applications or
                  proposals submitted by the Recipient.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={7} title="Marketing and Promotion">
            <div className="space-y-4">
              <Clause number="7.1">
                <p>
                  You will not make, issue or encourage and other person or
                  entity to make or issue, any press releases or similar public
                  statement or announcements (including, without limitation, via
                  social media, podcast, webinar, interview, Telegram, an app or
                  other publicly accessible medium) in connection with the
                  Grant, without the prior written approval of the Foundation
                  (which will not be unreasonably withheld).
                </p>
              </Clause>
              <Clause number="7.2">
                <p>
                  The Foundation may, but is not required to, make public any
                  Grant under these Terms. Upon request by the Foundation, you
                  will provide to the Foundation product descriptions, images,
                  logos, website links and other content regarding the Grant as
                  may be reasonably requested by the Foundation for inclusion in
                  such publications
                </p>
              </Clause>
              <Clause number="7.3">
                <p>
                  You agree to use best efforts to enable and procure the
                  Foundation&apos;s participation in co-branding and
                  co-marketing opportunities with the goal of increasing the
                  awareness and usage of the NEAR Technology.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={8} title="Representations and Warranties">
            <div className="space-y-4">
              <Clause number="8.1">
                <p>
                  You represent and warrant that each of the following
                  statements is true and accurate and all of the information you
                  provided was and shall remain true and complete:
                </p>
                <AlphaList>
                  <li>
                    If you are applying for a Grant on behalf of a legal entity,
                    such legal entity is duly organized and validly existing
                    under the applicable laws of the jurisdiction of its
                    organization and you are duly authorized by such legal
                    entity to act on its behalf;
                  </li>
                  <li>
                    you are of legal age to form a binding contract (at least 18
                    years old in most jurisdictions);
                  </li>
                  <li>
                    you have the right, full power and authority to enter into
                    these Terms to exercise your rights and perform your
                    obligations under these Terms and in doing so will not
                    violate any other agreement to which you are a Party nor any
                    laws;
                  </li>
                  <li>
                    these Terms constitutes a legal, valid and binding
                    obligation on you which are enforceable against you in
                    accordance with their terms;
                  </li>
                  <li>
                    no consent, authorisation, license or approval of or notice
                    to any governmental authority nor your shareholders,
                    partners, members, other record or beneficial owners or
                    other any relevant person (as applicable) is required to
                    authorize the execution, delivery, validity, enforceability
                    or admissibility in evidence of the performance by you of
                    your obligations under these Terms;
                  </li>
                  <li>
                    you are not a citizen of, or resident in or located in, or
                    incorporated or otherwise a country:
                  </li>
                  <li>
                    listed on any of the following lists (each a{' '}
                    <Term>Sanctions List</Term>): the Consolidated United
                    Nations Security Council Sanctions List; the Specially
                    Designated Nationals and Blocked Persons List or the
                    Sectoral Sanctions Identification List maintained by the US
                    Office of Foreign Assets Control (OFAC); the Consolidated
                    List of Persons, Groups and Entities subject to EU Financial
                    Sanctions; the Consolidated List of Financial Sanctions
                    Targets or List of persons subject to restrictive measures
                    in view of Russia&apos;s actions destabilizing the situation
                    in Ukraine, maintained by the UK Treasury; the Overall List
                    of Sanctioned Individuals, Entities and Organizations
                    maintained by the Swiss State Secretariat for Economic
                    Affairs (SECO); &apos;Ordinance lists of the Swiss Federal
                    Council&apos;; or any similar list maintained by, or public
                    announcement of sanctions made by, any other Sanctions
                    Authority (as defined below);
                  </li>
                  <li>
                    owned or controlled by, or acting on behalf of or for the
                    benefit of, any person on a Sanctions List;
                  </li>
                  <li>
                    located in, resident in or incorporated under the laws of
                    (as applicable) Syria, Iran, Cuba, Russia or North Korea,
                    Crimea, Donetsk and Luhansk, or any other country or
                    territory which, after the Effective Date, becomes the
                    target of such comprehensive, country-wide or territory-wide
                    Sanctions (as defined below) as currently apply to the
                    aforementioned territories; or
                  </li>
                  <li>
                    the target of any sanctions laws, regulations, embargoes or
                    restrictive measures (Sanctions), as amended from time to
                    time, administered, enacted or enforced by: the United
                    Nations, the United States, the European Union or any Member
                    State thereof, the United Kingdom, Switzerland or the
                    respective Governmental Authorities and agencies of any of
                    the foregoing responsible for administering, enacting or
                    enforcing Sanctions, including without limitation, OFAC, the
                    US Department of State, the United Kingdom Treasury or the
                    SECO (Sanctions Authority);
                  </li>
                  <li>
                    the information that was submitted to the Foundation in
                    connection with the Grant, and in any reports or
                    communications delivered to the Foundation (including in
                    respect of any Due Diligence), is accurate and complete;
                  </li>
                  <li>
                    the Wallet Address is not subject to any Sanctions and it is
                    a wallet that you own and control;
                  </li>
                  <li>
                    any Software developed to achieve the Purpose will be free
                    of material defects, bugs or vulnerabilities;
                  </li>
                  <li>
                    you will comply with any laws applicable to your Software
                    and not engage in any illegal activities. In particular, you
                    will not use the NEAR Protocol to facilitate infringement of
                    any third party Intellectual Property Rights or data privacy
                    rights;
                  </li>
                  <li>
                    no litigation, claim, arbitration, action, suit or
                    administrative proceedings of any kind are taking place or
                    pending, or to the best of your knowledge and belief (after
                    due and careful enquiry), have been threatened against you;
                    and
                  </li>
                  <li>
                    you have the technical ability and resources necessary to
                    fulfill its obligations under these Terms and, in
                    particular, in connection with the Purpose.
                  </li>
                </AlphaList>
              </Clause>
              <Clause number="8.2">
                <p>
                  You shall indemnify and hold harmless the Foundation from any
                  third party claims (including reasonable attorney&apos;s
                  costs) raised against the Foundation based on an alleged
                  infringement of the above representations and warranties.
                </p>
              </Clause>
              <Clause number="8.3">
                <p>
                  You are aware and confirm that the Foundation is relying on
                  the above representations (which are material to the
                  Foundation) and that if it were not for your representations
                  and warranties in this clause, the Foundation would not
                  provide the Grant to you.
                </p>
              </Clause>
              <Clause number="8.4">
                <p>
                  The Foundation does not provide any warranty that the Software
                  will be compatible with the NEAR Technology or any related
                  technology now or in the future.
                </p>
              </Clause>
              <Clause number="8.5">
                <p>
                  The Foundation does not provide any warranty or representation
                  (whether express or implied) of any kind in respect of the
                  Grant, the Purpose or otherwise under or in connection with
                  these Terms.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={9} title="Taxes and Other Duties">
            <div className="space-y-4">
              <Clause number="9.1">
                <p>
                  You are solely responsible for determining what, if any, taxes
                  or other duties apply to the Grant. It is also your
                  responsibility to withhold, collect, report, and remit the
                  correct taxes to the appropriate tax authorities, according to
                  the legislation in force. The Foundation is not responsible
                  and shall be in no way held liable for withholding,
                  collecting, reporting, and remitting and taxes arising from,
                  or in connection to the Grant.
                </p>
              </Clause>
              <Clause number="9.2">
                <p>
                  Neither party will have any right, power or authority to
                  create any obligation, expressed or implied, on behalf of the
                  other party in connection with these Terms.
                </p>
              </Clause>
              <Clause number="9.3">
                <p>
                  The Foundation makes no representation or warranty that you
                  will profit in any way or derive any benefit from these Terms.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={10} title="Intellectual Property">
            <div className="space-y-4">
              <Clause number="10.1">
                <p>
                  Both Parties shall retain full rights, title and interest in
                  and to any pre-existing Intellectual Property Rights owned by
                  them prior to entering this Agreement and in any improvements
                  made to the relevant parties pre-existing Intellectual
                  Property Rights during the term of this Agreement.
                </p>
              </Clause>
              <Clause number="10.2">
                <p>
                  Each Party grants to the other Party a royalty-free,
                  non-exclusive licence to use the first party&apos;s
                  pre-existing Intellectual Property Rights for the purposes of
                  this Agreement.
                </p>
              </Clause>
              <Clause number="10.3">
                <p>
                  You retain ownership of all Intellectual Property Rights
                  created by you, except as otherwise specified and subject to
                  the licence you grant below.
                </p>
              </Clause>
              <Clause number="10.4">
                <p>
                  Parties may specify in the NEARN Proposal whether, in respect
                  of the relevant Grant: (i) Intellectual Property Rights
                  created by you (or any part of it) must be made available on
                  an open-source basis (an <Term>Open-Source Requirement</Term>
                  ); and/or (ii) the Intellectual Property Rights created by you
                  (or any part of it) must be assigned to the Foundation or an
                  entity designated by it (an{' '}
                  <Term>Assignment Requirement</Term>). The elections recorded
                  in the approved NEARN Proposal form part of these Terms and,
                  in respect of the relevant Grant, prevail over this clause in
                  the event of any conflict.
                </p>
              </Clause>
              <Clause number="10.5">
                <p>
                  To the extent Grant IP is not assigned to the Foundation under
                  an Assignment Requirement, you grant (and will procure the
                  grant to) the Foundation of a perpetual, irrevocable,
                  worldwide, royalty-free, non-exclusive, sublicensable and
                  transferable licence to use, copy, modify, distribute,
                  publish, publicly display and create derivative works of the
                  Grant IP for any purpose connected with the Foundation, the
                  NEAR Technology and the NEAR Ecosystem. This licence survives
                  termination of these Terms.
                </p>
              </Clause>
              <Clause number="10.6">
                <p>
                  Where an Open-Source Requirement applies, you will, no later
                  than the date specified in the NEARN Proposal (or, failing
                  that, on Achievement of the Purpose), make the relevant
                  Intellectual Property Rights publicly available under an
                  open-source licence approved by the Foundation, together with
                  reasonable accompanying documentation. An OSI-approved licence
                  (such as the MIT, Apache 2.0 or GPLv3 licence) will be deemed
                  acceptable unless the Foundation specifies otherwise in the
                  NEARN Proposal. You will not impose any field-of-use,
                  commercial or other restriction inconsistent with the approved
                  licence.
                </p>
              </Clause>
              <Clause number="10.7">
                <p>
                  Where an Assignment Requirement applies, you hereby assign,
                  and will procure that your personnel and contractors assign,
                  to the Foundation (or its designated entity) with full title
                  guarantee all Intellectual Property Rights in it, such
                  assignment taking effect on creation or, in respect of future
                  rights, immediately on their coming into existence. You waive,
                  and will procure the waiver of, all moral rights in the
                  Intellectual Property Law to the extent permitted by
                  Applicable Laws.
                </p>
              </Clause>
              <Clause number="10.8">
                <p>
                  You own all existing and future rights, titles and interests
                  in and to the logos, trade names, strap lines, trademarks or
                  service marks (registered or unregistered), accompanying
                  artwork, designs, slogans, texts and other collateral
                  marketing signs as made available by you which are not
                  open-source, to the Foundation from time to time, including
                  all associated Intellectual Property Rights (
                  <Term>Recipient Marks</Term>). In relation to these Recipient
                  Marks, you grant to the Foundation a non-exclusive, worldwide,
                  royalty-free, sublicensable right and license to use,
                  reproduce, distribute, display, publish and transmit the
                  Recipient Marks solely in connection with these Terms, the
                  Purpose, and the Foundation&apos;s business including, without
                  limitation, for the advertisement, growth and promotion of the
                  Foundation, the NEAR Technology and the NEAR Ecosystem, in any
                  media formats, through any media channels or otherwise.
                </p>
              </Clause>
              <Clause number="10.9">
                <p>
                  Nothing in these Terms will be construed as a representation
                  or agreement that the Foundation will not develop or have
                  developed products, concepts, systems or techniques that are
                  similar to or compete with any products, concepts, systems or
                  techniques contemplated by or embodied in any materials or
                  information provided by you (including its team members) to
                  the Foundation in connection with these Terms and/or the
                  Grant.
                </p>
              </Clause>
              <Clause number="10.10">
                <p>
                  The Foundation owns or has a license to use all existing and
                  future rights, titles and interests in and to the logos, trade
                  names, strap lines, trade or service marks (registered or
                  unregistered), accompanying artwork, designs, slogans, texts
                  and other collateral marketing signs of the Foundation or the
                  NEAR Technology, including all associated Intellectual
                  Property Rights (<Term>NEAR Marks</Term>). The Foundation
                  grants to you the non-transferable and non-exclusive right to
                  use the NEAR Marks as necessary for the purposes of these
                  Terms and until its termination, provided that you will
                  strictly:
                </p>
                <AlphaList>
                  <li>
                    follow all brand guidelines provided by the Foundation,
                    including (without limitation), the guidelines found at{' '}
                    <a
                      href="https://near.org/brand/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://near.org/brand/
                    </a>
                    {'. '}
                    These guidelines may cover aspects such as logo usage, color
                    schemes, typography, and more; and
                  </li>
                  <li>
                    collaborate with the Foundation to coordinate the use of the
                    NEAR Marks in any promotional materials, events, or
                    activities. It is mandatory for you to obtain written
                    approval from the Foundation before using the NEAR Marks in
                    any capacity.
                  </li>
                </AlphaList>
              </Clause>
            </div>
          </Section>

          <Section number={11} title="Confidentiality and Data Protection">
            <div className="space-y-4">
              <Clause number="11.1">
                <p>
                  The Parties shall maintain strict confidentiality and not
                  disclose any Confidential Information (<Term>CI</Term>),
                  except as allowed in this Clause 11.
                </p>
              </Clause>
              <Clause number="11.2">
                <p>
                  The Parties share CI solely to perform this Agreement (
                  <Term>Permitted Purpose</Term>). Neither Party may use CI
                  beyond the purpose of this Agreement and as specified in this
                  Clause 11, such as for the creation of competing products or
                  services, or incorporation of it into their own products or
                  services, or refer to it in their marketing or development
                  efforts.
                </p>
              </Clause>
              <Clause number="11.3">
                <p>
                  Neither Party shall disclose the other&apos;s CI without
                  written consent, except as expressly permitted herein.
                  Disclosure is limited to Affiliates, directors, officers,
                  employees, agents, other designated entities and other
                  representatives. The Receiving Party must acknowledge its
                  proprietary nature and agree to keep it confidential in
                  accordance with this Clause 11.
                </p>
              </Clause>
              <Clause number="11.4">
                <p>
                  If the Receiving Party must disclose any CI due to a legal
                  order (a <Term>Compelled Disclosure Request</Term>), and if
                  permitted by law it shall notify the Disclosing Party within
                  at least four (4) Business Days to enable an appropriate
                  response, including but not limited to the pursuit of a
                  protective order.
                </p>
              </Clause>
              <Clause number="11.5">
                <p>
                  The confidentiality obligations of this Clause 11 shall extend
                  for two (2) years post-termination. Upon written request, the
                  Receiving Party shall promptly destroy or return the
                  Disclosing Party&apos;s CI, except as required by law.
                </p>
              </Clause>
              <Clause number="11.6">
                <p>
                  Each Party agrees that, in performing this Agreement, it will
                  comply with all applicable requirements of any Applicable Data
                  Protection Laws and confirms that any data subjects whose
                  personal data is being transferred to and processed by the
                  other Party will be appropriately notified.
                </p>
              </Clause>
              <Clause number="11.7">
                <p>
                  Any personal information submitted by the Recipient in
                  connection with this Agreement will be used for the purposes
                  described in this Agreement and will otherwise be handled in
                  accordance with the Foundation&apos;s Privacy Policy, located
                  at{' '}
                  <a
                    href="https://near.foundation/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://near.foundation/privacy/
                  </a>{' '}
                  (which may be updated from time to time), and the Recipient
                  acknowledges and agrees to such use. The Foundation is
                  entitled to share the Recipient&apos;s data and information
                  with its Affiliates and other designated entities.
                </p>
              </Clause>
              <Clause number="11.8">
                <p>
                  The Recipient acknowledges and agrees that the Foundation may
                  record, exchange, analyse and use relevant information about
                  the Recipient, and their relationships, with Affiliates and
                  and other designated entities of the Foundation as it sees fit
                  to pursue advancing the NEAR Technology and expansion of the
                  NEAR Ecosystem. For these purposes, &ldquo;relevant
                  information&rdquo; may include, but is not limited to (i)
                  business, technical, and/or professional information,
                  excluding CI.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={12} title="Indemnification">
            <Clause number="12.1">
              <p>
                You will indemnify, defend and hold harmless the Foundation (and
                its directors, officers, employees, Affiliates, subsidiaries and
                agents) against any claims, actions proceedings, losses,
                damages, expenses and costs (including without limitation court
                costs and reasonable legal fees) arising out of or in connection
                with:
              </p>
              <AlphaList>
                <li>
                  the making, acceptance or use of the Grant (and/or any other
                  benefit you receive under these Terms);
                </li>
                <li>the pursuit by you of the Purpose;</li>
                <li>
                  any claim that the Purpose infringes the rights (including,
                  without limitation, Intellectual Property Rights) of any third
                  party; or
                </li>
                <li>
                  any breach by you of any provision of these Terms, provided
                  that you are given reasonably prompt notice of any such claim.
                </li>
              </AlphaList>
            </Clause>
          </Section>

          <Section number={13} title="Liability">
            <p>
              You acknowledge and agree that, to the extent permissible by law,
              the Foundation will have no liability to you or any other NEAR
              Ecosystem participant for any liability howsoever arising (whether
              in tort (including for negligence) contract, misrepresentation
              (whether innocent or negligent), restitution or otherwise) in
              respect of the Purpose, the Software, the Grant, the NEAR
              Technology, or any action taken by the Foundation or you in
              connection with these Terms.
            </p>
          </Section>

          <Section number={14} title="Term">
            <p>
              These Terms are binding on the Recipient for one year from the
              Effective Date (&ldquo;Term&rdquo;) after which they terminate
              automatically.
            </p>
          </Section>

          <Section number={15} title="Changes to these Terms">
            <p>
              We may revise and update these Terms from time to time in our sole
              discretion. All changes are effective immediately when we publish
              them and apply to all Proposals submitted thereafter. Your
              continued submission of Proposals following the posting of revised
              Terms means that you accept and agree to the changes.
            </p>
          </Section>

          <Section number={16} title="Governing Law and Jurisdiction">
            <div className="space-y-4">
              <Clause number="16.1">
                <p>
                  All matters relating to these Terms, and any dispute or claim
                  arising therefrom or related thereto (in each case, including
                  non-contractual disputes or claims), shall be governed by and
                  construed in accordance with the laws of Switzerland.
                </p>
              </Clause>
              <Clause number="16.2">
                <p>
                  Any legal suit, action, or proceeding arising out of, or
                  related to these Terms shall be instituted exclusively in the
                  courts of Zug, although we retain the right to bring any suit,
                  action, or proceeding against you for breach of these Terms in
                  your country of residence or any other relevant country.
                </p>
              </Clause>
              <Clause number="16.3">
                <p>
                  You waive any and all objections to the exercise of
                  jurisdiction over you by such courts and to venue in such
                  courts.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={17} title="Limitation on Time to File Claims">
            <p>
              ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR
              RELATING TO THESE TERMS MUST BE COMMENCED WITHIN ONE (1) YEAR
              AFTER THE CAUSE OF ACTION ACCRUES, OTHERWISE, SUCH CAUSE OF ACTION
              OR CLAIM IS PERMANENTLY BARRED.
            </p>
          </Section>

          <Section number={18} title="Waiver and Severability">
            <div className="space-y-4">
              <Clause number="18.1">
                <p>
                  No waiver by us of any term or condition set out in these
                  Terms shall be deemed a further or continuing waiver of such
                  term or condition or a waiver of any other term or condition,
                  and any failure of us to assert a right or provision under
                  these Terms shall not constitute a waiver of such right or
                  provision.
                </p>
              </Clause>
              <Clause number="18.2">
                <p>
                  If any provision of these Terms is held by a court or other
                  tribunal of competent jurisdiction to be invalid, illegal or
                  unenforceable for any reason, such provision shall be
                  eliminated or limited to the minimum extent such that the
                  remaining provisions of the Terms will continue in full force
                  and effect.
                </p>
              </Clause>
            </div>
          </Section>

          <Section number={19} title="Entire Agreement">
            <p>
              The Terms (including any terms expressly referred to herein, to
              the extent governing the relationship between you and the
              Foundation) constitute the sole and entire agreement between you
              and the Foundation regarding the Grant and supersede all prior and
              contemporaneous understandings, agreements, representations, and
              warranties, both written and oral, regarding the Grant.
            </p>
          </Section>

          <Section number={20} title="Contact">
            <p>
              If you have any questions about these Terms please contact us via{' '}
              <a href="mailto:legal@near.foundation">legal@near.foundation</a>.
            </p>
          </Section>

          <Section number={21} title="Definitions Used in these Terms">
            <Clause number="21.1">
              <p>In these Terms, the following definitions will apply:</p>
            </Clause>
            <dl className="mt-2 border-t border-slate-200">
              <Definition term="Achievement">
                <p>
                  achievement of the Purpose to the satisfaction of the
                  Foundation and/or the Relevant Community (and{' '}
                  <Term>Achieved</Term> shall be construed accordingly);
                </p>
              </Definition>
              <Definition term="Affiliate">
                <p>
                  in respect of a party any person who, directly or indirectly,
                  controls, is controlled by, or is under common control with
                  that party, and for these purposes &ldquo;control&rdquo; and
                  &ldquo;controlling&rdquo; are defined as directly or
                  indirectly possessing the power to direct or cause the
                  direction of the management and policies of such a person,
                  whether through ownership of voting interests, by contract or
                  otherwise;
                </p>
              </Definition>
              <Definition term="Applicable Laws">
                <p>
                  all applicable laws (including securities laws), statutes,
                  regulations and codes from time to time in force;
                </p>
              </Definition>
              <Definition term="Applicable Data Protection Laws:">
                <p>
                  all Applicable Laws relating to data processing, protection,
                  and the privacy of individuals, including the UK GDPR (as
                  defined in section 3(10), as supplemented by section 205(4),
                  of the UK&apos;s Data Protection Act 2018) and the EU GDPR
                  (General Data Protection Regulation (EU) 2016/679));
                </p>
              </Definition>
              <Definition term="Business Day">
                <p>
                  a day, other than a Saturday, Sunday or public holiday in
                  Switzerland, when banks are open for business;
                </p>
              </Definition>
              <Definition term="Business Hours">
                <p>the period from 9.00 am to 5.00 pm on any Business Day;</p>
              </Definition>
              <Definition term="Chain Signatures">
                <p>
                  the multi-party computation (MPC) network that enables
                  accounts on the NEAR Protocol, including smart contracts, to
                  sign and execute transactions on other blockchains, known as
                  &ldquo;Chain Signatures&rdquo;;
                </p>
              </Definition>
              <Definition term="Change of Control">
                <p>
                  where a person or entity who Controls any body corporate
                  ceases to do so or if another person or entity acquires
                  Control of it. For these purposes, <Term>Control</Term> means
                  in relation to a body corporate, the power of a person or
                  entity to secure that the affairs of the body corporate are
                  conducted in accordance with the wishes of that person or
                  entity:
                </p>
                <NumberedList className="list-[upper-roman]">
                  <li>
                    by means of the holding of shares, or the possession of
                    voting power, in or in relation to that or any other body
                    corporate; or
                  </li>
                  <li>
                    as a result of any powers conferred by the constitution,
                    articles of association or any other document regulating
                    that or any other body corporate;
                  </li>
                </NumberedList>
              </Definition>
              <Definition term="Confidential Information">
                <p>
                  means all information of a confidential and proprietary
                  nature, whether created before or after the date of these
                  Terms, which the disclosing Party (
                  <Term>Disclosing Party</Term>) or its representatives directly
                  or indirectly discloses, or makes available, to the receiving
                  Party (<Term>Receiving Party</Term>) or its representatives or
                  any of its Affiliates, or their representatives before, on or
                  after the date of these Terms, including:
                </p>
                <NumberedList className="list-[lower-roman]">
                  <li>
                    all business, financial, technical, operational, commercial,
                    employee, management and other information, data, experience
                    and expertise of whatever kind (including information
                    relating to trade secrets, know-how, designs, software (both
                    source code and object code), intellectual property rights,
                    inventions, patents, technology, operations, processes,
                    plans, intentions, product information and development,
                    marketing knowledge, marketing opportunities and sales
                    information, business plans and dealings, financial
                    information, forecasts, budgets, and plans, historic and
                    current and future transactions, affairs and/or business) of
                    the Disclosing Party; and
                  </li>
                  <li>
                    information derived from information falling within
                    paragraph (i) above including analyses, compilations,
                    studies and other documents prepared by any Party to these
                    Terms or on their behalf which contain or otherwise reflect
                    or are generated from the information specified in paragraph
                    (ii);
                  </li>
                </NumberedList>
                <p>but not including information which:</p>
                <NumberedList className="list-[lower-roman]">
                  <li>
                    is in the public domain at the time of disclosure or which
                    subsequently comes into the public domain through no breach
                    of these Terms by the Receiving Party;
                  </li>
                  <li>
                    was already lawfully in the possession of the Receiving
                    Party prior to its disclosure by the Disclosing Party;
                  </li>
                  <li>
                    is subsequently disclosed to the Receiving Party by a third
                    Party who, to the Receiving Party&apos;s knowledge, did not
                    breach any confidentiality obligations in respect of the
                    information and/or from someone owing a duty of confidence
                    to the Disclosing Party; or
                  </li>
                  <li>
                    the Parties have agreed in writing that it is not
                    confidential.
                  </li>
                </NumberedList>
              </Definition>
              <Definition term="NEARN Payment Proposal">
                <p>as defined in clause 2.5;</p>
              </Definition>
              <Definition term="Effective Date">
                <p>
                  the date on which the Proposal is submitted by you to the
                  Relevant Community;
                </p>
              </Definition>
              <Definition term="Grant">
                <p>
                  the grant given by the Foundation to you pursuant to, and in
                  accordance with these Terms, following Proposal approval by
                  the Relevant Community;
                </p>
              </Definition>
              <Definition term="Intellectual Property Rights">
                <p>
                  patent rights (including patent applications and disclosures),
                  copyrights, trademarks, trade secret rights, business names
                  and domain names, goodwill and the right to sue for passing
                  off, rights in designs, rights in computer software, database
                  rights, rights to use, and protect the confidentiality of,
                  confidential information (including know-how and trade
                  secrets) and all other intellectual property rights, in each
                  case whether registered or unregistered and including all
                  applications and rights to apply for and be granted, renewals
                  or extensions of, and rights to claim priority from, such
                  rights and all similar or equivalent rights or forms of
                  protection which subsist or will subsist now or in the future
                  in any part of the world;
                </p>
              </Definition>
              <Definition term="NEAR Ecosystem">
                <p>
                  the NEAR Technology&apos;s ecosystem, comprised of the
                  projects and applications that have been or are being
                  developed and/or built on, or are running on, the NEAR
                  Technology and their respective communities, contributors and
                  developers;
                </p>
              </Definition>
              <Definition term="NEAR Intents">
                <p>
                  the decentralised universal settlement protocol using
                  JSON-structured requests processed by competing and compatible
                  solvers to execute cross-chain and off-chain interactions and
                  transactions leveraging one or more component(s) of the NEAR
                  Technology, enabling AI-driven automation (where necessary and
                  relevant) and seamless actions (including, but not limited to,
                  asset transfers) across multiple blockchains, known as
                  &ldquo;NEAR Intents&rdquo;;
                </p>
              </Definition>
              <Definition term="NEAR Protocol">
                <p>
                  the sharded, developer-friendly, proof-of-stake, layer one
                  blockchain, known as &ldquo;NEAR Protocol;
                </p>
              </Definition>
              <Definition term="NEAR Technology">
                <p>
                  NEAR Protocol, NEAR Intents, Chain Signatures, and the
                  OmniBridge;
                </p>
              </Definition>
              <Definition term="NEAR Tokens">
                <p>the native cryptographic currency of the NEAR Protocol;</p>
              </Definition>
              <Definition term="OmniBridge">
                <p>
                  the multi-chain asset bridge that facilitates secure and
                  efficient transfers of Tokens between different blockchains by
                  leveraging Chain Signatures, known as the
                  &ldquo;OmniBridge&rdquo;;
                </p>
              </Definition>
              <Definition term="Proposal">
                <p>
                  funding proposals submitted to the Relevant Community by
                  members of the NEAR Ecosystem for products and/or services
                  connected to the Purpose. Relevant Community and/or
                  Supervisor&apos;s approval of the Proposal is a condition of
                  the Grant;
                </p>
              </Definition>
              <Definition term="Relevant Community">
                <p>
                  the NEAR Ecosystem community responsible for the approval of
                  the Proposal through the NEAR Ecosystem governance system.
                  Communities are responsible for the approval of Proposals
                  entitled to receive the Grants. For the purpose of these
                  Terms, the term &lsquo;Relevant Communities&rsquo; here
                  include but is not limited to DevHub, Builder Ops, and the
                  Events Committee;
                </p>
              </Definition>
              <Definition term="Software">
                <p>
                  any software (of whatever nature) created, developed and/or
                  deployed of software in respect of achieving the Purpose;
                </p>
              </Definition>
              <Definition term="Supervisors">
                <p>
                  any moderator or appointed representative of the Relevant
                  Community responsible for reviewing, analyzing and/or
                  approving the Proposals; and
                </p>
              </Definition>
              <Definition term="Token">
                <p>
                  any cryptographical coin, token or currency, including
                  (without limitation) the NEAR Token.
                </p>
              </Definition>
            </dl>
          </Section>
        </div>
      </article>
    </Default>
  );
}
