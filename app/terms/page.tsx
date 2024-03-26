"use client";

/* Components */
import NavHeader from "@/components/NavHeader/NavHeader";

/* Styles */
import style from "./terms.module.css";

const Terms = () => {
	return (
		<>
			<NavHeader />

			<div className={style.container}>
				<h1>Terms and Conditions of Demo Platform for Snippet Storage</h1>

				<p>
					Welcome to our demo platform for storing code snippets. Before using
					this service, please carefully read and understand the following terms
					and conditions governing your use of the platform:
				</p>

				<ol>
					<li>
						<strong>Acceptance of Terms:</strong> By accessing or using the demo
						platform for snippet storage, you agree to be bound by these Terms
						and Conditions. If you do not agree with any part of these terms,
						you may not use the service.
					</li>

					<li>
						<strong>Use of Service:</strong> This demo platform is provided for
						demonstration purposes only. You may use the platform to store and
						manage code snippets for personal or educational purposes.
					</li>

					<li>
						<strong>Prohibited Activities:</strong> You agree not to use the
						platform for any unlawful or unauthorized purpose. Prohibited
						activities include, but are not limited to, the following:
						<ul>
							<li>Uploading or sharing malicious code or content.</li>
							<li>Violating any applicable laws or regulations.</li>
							<li>Impersonating any person or entity.</li>
							<li>Interfering with the proper functioning of the platform.</li>
							<li>
								Attempting to gain unauthorized access to any accounts or
								systems.
							</li>
						</ul>
					</li>

					<li>
						<strong>Content Ownership:</strong> You retain ownership of any code
						snippets or content you upload to the platform. However, by
						uploading content, you grant us a non-exclusive, royalty-free
						license to use, reproduce, modify, adapt, and distribute the content
						for the purpose of operating and improving the platform.
					</li>

					<li>
						<strong>No Warranty:</strong> The demo platform is provided on an
						&quot;as-is&quot; and &quot;as-available&quot; basis, without any
						warranty of any kind. I do not guarantee that the platform will be
						error-free or uninterrupted. I disclaim all warranties, express or
						implied, including but not limited to warranties of merchantability,
						fitness for a particular purpose, and non-infringement.
					</li>

					<li>
						<strong>Limitation of Liability:</strong> In no event shall I be
						liable for any indirect, incidental, special, consequential, or
						punitive damages arising out of or relating to your use of the demo
						platform, even if I have been advised of the possibility of such
						damages. Our total liability for any claims arising out of or
						relating to these terms shall not exceed the amount paid by you, if
						any, to use the platform.
					</li>

					<li>
						<strong>Modifications:</strong> I reserve the right to modify or
						discontinue the demo platform at any time without notice. I may also
						modify these terms at any time by posting the revised terms on the
						platform. Your continued use of the platform after such
						modifications will constitute your acceptance of the revised terms.
					</li>

					<li>
						<strong>Contact Me:</strong> If you have any questions or concerns
						about these terms, please contact us at{" "}
						<a href="mailto:infot@vianch.com">info@vianch.com</a>.
					</li>
				</ol>

				<p>
					By using the demo platform for snippet storage, you acknowledge that
					you have read, understood, and agree to be bound by these terms and
					conditions.
				</p>
			</div>
		</>
	);
};

export default Terms;
