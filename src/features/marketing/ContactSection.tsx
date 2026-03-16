import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";

type Channel = {
  title: string;
  body: string;
  action: string;
  hint: string;
};

export function ContactSection() {
  const { t } = useTranslation();
  const channels = t("contact.channels", { returnObjects: true }) as Channel[];

  return (
    <section
      className="border-t border-border bg-muted/10"
      id="support-path"
    >
      <div className="mx-auto w-full max-w-[90rem]">
        <div className="flex flex-col gap-8 border-b border-border px-6 py-16 sm:px-12 lg:flex-row lg:items-end lg:justify-between lg:px-16 lg:py-24">
          <div className="space-y-6 max-w-3xl">
            <p className="inline-block border border-border bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              {t("contact.eyebrow")}
            </p>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("contact.title")}
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("contact.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-2">
          {channels.map((channel, idx) => (
            <div
              key={channel.title}
              className="bg-background p-8 sm:p-12 lg:p-16 hover:bg-muted/5 transition-colors group"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">0{idx + 1}</span>
                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl mb-6">
                {channel.title}
              </h3>
              <p className="text-base font-medium leading-relaxed text-muted-foreground mb-12 max-w-md">
                {channel.body}
              </p>
              <div className="border-l-2 border-primary bg-muted/20 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  {channel.action}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{channel.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
