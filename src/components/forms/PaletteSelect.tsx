import React, { FC, useEffect, useState } from "react";
import { useAppSelector } from "store/hooks";
import styled from "styled-components";
import { DMG_PALETTE } from "consts";
import { paletteSelectors } from "store/features/entities/entitiesState";
import { Palette } from "shared/lib/entities/entitiesTypes";
import PaletteBlock from "components/forms/PaletteBlock";
import {
  Option,
  Select,
  OptionLabelWithPreview,
  SingleValueWithPreview,
  SelectCommonProps,
} from "ui/form/Select";
import l10n from "shared/lib/lang/l10n";
import { paletteName } from "shared/lib/entities/entitiesHelpers";

interface PaletteSelectProps extends SelectCommonProps {
  name: string;
  prefix?: string;
  value?: string;
  type?: "tile" | "sprite";
  onChange?: (newId: string) => void;
  optional?: boolean;
  optionalLabel?: string;
  optionalDefaultPaletteId?: string;
  canKeep?: boolean;
  canRestore?: boolean;
  keepLabel?: string;
}

interface PaletteOption extends Option {
  palette?: Palette;
}

const PaletteSelectPrefix = styled.div`
  min-width: 13px;
  padding-right: 2px;
  font-weight: bold;
`;

export const PaletteSelect: FC<PaletteSelectProps> = ({
  name,
  value,
  prefix,
  type,
  onChange,
  optional,
  optionalLabel,
  optionalDefaultPaletteId,
  canKeep,
  canRestore,
  keepLabel,
  ...selectProps
}) => {
  const palettes = useAppSelector((state) => paletteSelectors.selectAll(state));
  const [options, setOptions] = useState<PaletteOption[]>([]);
  const [currentPalette, setCurrentPalette] = useState<Palette>();
  const [currentValue, setCurrentValue] = useState<PaletteOption>();

  useEffect(() => {
    setOptions(
      ([] as PaletteOption[]).concat(
        canKeep
          ? ([
              {
                value: "keep",
                label: keepLabel || "Keep",
              },
            ] as PaletteOption[])
          : [],
        canRestore
          ? ([
              {
                value: "restore",
                label: l10n("FIELD_RESTORE_DEFAULT"),
              },
            ] as PaletteOption[])
          : [],
        optional
          ? ([
              {
                value: "",
                label: optionalLabel || "None",
                palette:
                  palettes.find((p) => p.id === optionalDefaultPaletteId) ||
                  DMG_PALETTE,
              },
            ] as PaletteOption[])
          : ([] as PaletteOption[]),
        {
          value: DMG_PALETTE.id,
          label: l10n("FIELD_PALETTE_DEFAULT_DMG"),
          palette: DMG_PALETTE as Palette,
        },
        palettes.map((palette, index) => ({
          value: palette.id,
          label: paletteName(palette, index),
          palette,
        }))
      )
    );
  }, [
    palettes,
    canKeep,
    canRestore,
    keepLabel,
    optional,
    optionalDefaultPaletteId,
    optionalLabel,
  ]);

  useEffect(() => {
    if (value === DMG_PALETTE.id) {
      var dmgPalette: Palette = DMG_PALETTE;
      dmgPalette.name = l10n("FIELD_PALETTE_DEFAULT_DMG");
      setCurrentPalette(dmgPalette);
    } else {
      // @TODO Maybe overkill using deepcopy but couldn't think of a cleaner way to alter the palette name
      var palette: Palette = palettes.find((v) => v.id === value) as Palette;
      if (palette) {
        // Use localized palette name if default ID exists
        const pidx = palettes.findIndex((v) => v.id === value);
        let copyPalette = JSON.parse(JSON.stringify(palette));
        copyPalette.name = paletteName(copyPalette, pidx);
        setCurrentPalette(copyPalette);
      } else {
        setCurrentPalette(palettes.find((v) => v.id === value));
      }
    }
  }, [palettes, value]);

  useEffect(() => {
    if (canKeep && value === "keep") {
      setCurrentValue({
        value: "keep",
        label: keepLabel || "Keep",
      });
    } else if (canRestore && value === "restore") {
      setCurrentValue({
        value: "restore",
        label: l10n("FIELD_RESTORE_DEFAULT"),
      });
    } else if (currentPalette) {
      setCurrentValue({
        value: currentPalette.id,
        label: `${currentPalette.name}`,
        palette: currentPalette,
      });
    } else if (optional) {
      const optionalPalette =
        palettes.find((p) => p.id === optionalDefaultPaletteId) || DMG_PALETTE;
      setCurrentValue({
        value: "",
        label: optionalLabel || "None",
        palette: optionalPalette as Palette,
      });
    } else {
      setCurrentValue({
        value: "",
        label: l10n("FIELD_PALETTE_DEFAULT_DMG"),
        palette: DMG_PALETTE as Palette,
      });
    }
  }, [
    currentPalette,
    optionalDefaultPaletteId,
    optional,
    optionalLabel,
    palettes,
    canKeep,
    keepLabel,
    value,
    canRestore,
  ]);

  const onSelectChange = (newValue: Option) => {
    onChange?.(newValue.value);
  };

  return (
    <Select
      name={name}
      value={currentValue}
      options={options}
      onChange={onSelectChange}
      formatOptionLabel={(option: PaletteOption) => {
        return (
          <OptionLabelWithPreview
            preview={
              <PaletteBlock
                type={type}
                colors={option?.palette?.colors || []}
                size={20}
              />
            }
          >
            {option.label}
          </OptionLabelWithPreview>
        );
      }}
      components={{
        SingleValue: () => (
          <SingleValueWithPreview
            preview={
              <PaletteBlock
                type={type}
                colors={currentValue?.palette?.colors || []}
                size={20}
              />
            }
          >
            {prefix && <PaletteSelectPrefix>{prefix}</PaletteSelectPrefix>}
            {currentValue?.label}
          </SingleValueWithPreview>
        ),
      }}
      {...selectProps}
    />
  );
};
